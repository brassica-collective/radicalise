use serde::{Deserialize, Serialize};
use sqlx::{QueryBuilder, Sqlite, SqlitePool};
use utoipa::ToSchema;

use crate::{
    intervals::repo::{find_current_interval, find_next_interval},
    shared::entities::{
        CollectiveInvolvementWithDetails, CrewInvolvement, InvolvementStatus, OptOutType,
        ParticipationIntention,
    },
};

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyIntervalData {
    pub interval_id: i64,
    pub collective_involvement: Option<CollectiveInvolvementWithDetails>,
    pub crew_involvements: Vec<CrewInvolvement>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct MyInitialData {
    pub person_id: i64,
    pub current_interval: Option<MyIntervalData>,
    pub next_interval: Option<MyIntervalData>,
}

pub async fn find_detailed_involvement(
    collective_id: i64,
    person_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Option<CollectiveInvolvementWithDetails>, sqlx::Error> {
    sqlx::query_as!(
        CollectiveInvolvementWithDetails,
        "SELECT id, person_id, collective_id, interval_id, status as \"status: InvolvementStatus\",
        wellbeing, focus, capacity, participation_intention as \"participation_intention: ParticipationIntention\",
        opt_out_type as \"opt_out_type: OptOutType\", opt_out_planned_return_date
        FROM collective_involvements
        WHERE
            collective_id = ? AND
            person_id = ? AND
            interval_id = ?",
        collective_id,
        person_id,
        interval_id,
    )
    .fetch_optional(pool)
    .await
}

pub async fn upsert_detailed_involvement(
    involvement: CollectiveInvolvementWithDetails,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    let result = sqlx::query!(
        "INSERT INTO collective_involvements (person_id, collective_id, interval_id, status, wellbeing, focus, capacity, participation_intention, opt_out_type, opt_out_planned_return_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(person_id, collective_id, interval_id) DO UPDATE SET
            status = excluded.status,
            wellbeing = excluded.wellbeing,
            focus = excluded.focus,
            capacity = excluded.capacity,
            participation_intention = excluded.participation_intention,
            opt_out_type = excluded.opt_out_type,
            opt_out_planned_return_date = excluded.opt_out_planned_return_date",
        involvement.person_id,
        involvement.collective_id,
        involvement.interval_id,
        involvement.status,
        involvement.wellbeing,
        involvement.focus,
        involvement.capacity,
        involvement.participation_intention,
        involvement.opt_out_type,
        involvement.opt_out_planned_return_date
    )
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(sqlx::Error::RowNotFound);
    } else {
        Ok(())
    }
}

pub async fn find_interval_data_for_me(
    collective_id: i64,
    person_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<MyIntervalData, sqlx::Error> {
    let involvement =
        find_detailed_involvement(collective_id, person_id, interval_id, pool).await?;

    let crew_involvements = find_my_crew_involvements(person_id, interval_id, pool).await?;

    Ok(MyIntervalData {
        interval_id,
        collective_involvement: involvement,
        crew_involvements,
    })
}

pub async fn find_initial_data_for_me(
    collective_id: i64,
    person_id: i64,
    pool: &SqlitePool,
) -> Result<MyInitialData, sqlx::Error> {
    let current_interval = find_current_interval(collective_id, pool).await?;
    let next_interval = find_next_interval(collective_id, current_interval.id, pool).await?;

    let current_interval_data =
        find_interval_data_for_me(collective_id, person_id, current_interval.id, pool).await?;

    let next_interval_data = if let Some(interval) = next_interval {
        Some(find_interval_data_for_me(collective_id, person_id, interval.id, pool).await?)
    } else {
        None
    };

    Ok(MyInitialData {
        person_id,
        current_interval: Some(current_interval_data),
        next_interval: next_interval_data,
    })
}

// Returns the ids of all potentially impacted crews
pub async fn update_crew_involvements(
    person_id: i64,
    interval_id: i64,
    involvements: Vec<CrewInvolvement>,
    pool: &SqlitePool,
) -> Result<Vec<i64>, sqlx::Error> {
    let existing = find_my_crew_involvements(person_id, interval_id, pool).await?;

    // Ensure all the involvements have the same person_id and interval_id
    for involvement in &involvements {
        if involvement.person_id != person_id || involvement.interval_id != interval_id {
            eprintln!("Mismatched crew involvement: {:?}", involvement);
            return Err(sqlx::Error::RowNotFound);
        }
    }

    let crew_ids: Vec<i64> = involvements.iter().map(|i| i.crew_id).collect();

    // Involvements to remove
    let to_remove: Vec<CrewInvolvement> = existing
        .iter()
        .filter(|involvement| !crew_ids.contains(&involvement.crew_id))
        .cloned()
        .collect();

    let removed_crew_ids: Vec<i64> = to_remove.iter().map(|i| i.id).collect();

    println!("Deleting crew participations {:?}", to_remove);
    delete_crew_involvements(to_remove, pool).await?;

    println!("Upserting crew participations {:?}", involvements);
    upsert_crew_involvements(involvements, pool).await?;

    let impacted_crew_ids: Vec<i64> = crew_ids.into_iter().chain(removed_crew_ids).collect();

    Ok(impacted_crew_ids)
}

pub async fn find_my_crew_involvements(
    person_id: i64,
    interval_id: i64,
    pool: &SqlitePool,
) -> Result<Vec<CrewInvolvement>, sqlx::Error> {
    sqlx::query_as!(
        CrewInvolvement,
        "SELECT id, person_id, crew_id, interval_id, convenor, volunteered_convenor
        FROM crew_involvements
        WHERE person_id = ? AND interval_id = ?",
        person_id,
        interval_id
    )
    .fetch_all(pool)
    .await
}

pub async fn delete_crew_involvements(
    involvements: Vec<CrewInvolvement>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    if involvements.is_empty() {
        println!("No crew involvements to delete");
        return Ok(()); // Nothing to delete
    }

    let mut query_builder: QueryBuilder<Sqlite> =
        QueryBuilder::new("DELETE FROM crew_involvements WHERE id IN (");
    let mut separated = query_builder.separated(", ");
    for value_type in involvements.iter() {
        separated.push_bind(value_type.id);
    }
    separated.push_unseparated(") ");

    query_builder.build().execute(pool).await?;

    Ok(())
}

pub async fn upsert_crew_involvements(
    involvements: Vec<CrewInvolvement>,
    pool: &SqlitePool,
) -> Result<(), sqlx::Error> {
    if involvements.is_empty() {
        return Ok(()); // Nothing to add
    }

    let mut transaction = pool.begin().await?;

    for involvement in involvements {
        sqlx::query!(
            "INSERT INTO crew_involvements (person_id, crew_id, interval_id, convenor, volunteered_convenor)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (person_id, crew_id, interval_id) DO UPDATE SET
                convenor = excluded.convenor,
                volunteered_convenor = excluded.volunteered_convenor",
            involvement.person_id,
            involvement.crew_id,
            involvement.interval_id,
            involvement.convenor,
            involvement.volunteered_convenor
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    Ok(())
}
