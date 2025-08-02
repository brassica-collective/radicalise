use sqlx::{pool, SqlitePool};
use uuid::Uuid;

use crate::shared::entities::{CollectiveId, EntryPathway, ExpressionOfInterest};

pub async fn create_eoi(
    record: ExpressionOfInterest,
    pool: &SqlitePool,
) -> Result<EntryPathway, sqlx::Error> {
    let auth_token = Uuid::new_v4().to_string();
    let result = sqlx::query!(
        "INSERT INTO entry_pathways (collective_id, name, email, interest, context, referral, conflict_experience, participant_connections, auth_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        record.collective_id,
        record.name,
        record.email,
        record.interest,
        record.context,
        record.referral,
        record.conflict_experience,
        record.participant_connections,
        auth_token
    )
    .execute(pool)
    .await?;

    return find_entry_pathway(result.last_insert_rowid(), pool).await;
}

pub async fn update_eoi(
    record: ExpressionOfInterest,
    pool: &SqlitePool,
) -> Result<EntryPathway, sqlx::Error> {
    sqlx::query!(
        "UPDATE entry_pathways
        SET name = ?, email = ?, interest = ?, context = ?, referral = ?, conflict_experience = ?, participant_connections = ?
        WHERE id = ?",
        record.name,
        record.email,
        record.interest,
        record.context,
        record.referral,
        record.conflict_experience,
        record.participant_connections,
        record.id
    )
    .execute(pool)
    .await?;

    return find_entry_pathway(record.id, pool).await;
}

pub async fn delete_eoi(pool: &SqlitePool, auth_token: String, collective_id: CollectiveId) -> Result<(), sqlx::Error> {
    sqlx::query!(
        "DELETE FROM entry_pathways
        WHERE auth_token = ? AND collective_id = ?",
        auth_token,
        collective_id.id
    )
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn find_entry_pathway(id: i64, pool: &SqlitePool) -> Result<EntryPathway, sqlx::Error> {
    let entry_pathway = sqlx::query_as!(
        EntryPathway,
        "SELECT id, collective_id, name, interest, context, referral, conflict_experience, participant_connections
        FROM entry_pathways
        WHERE id = ?",
        id
    )
    .fetch_one(pool)
    .await?;

    Ok(entry_pathway)
}

pub async fn find_eoi_by_auth_token(
    collective_id: CollectiveId,
    auth_token: &str,
    pool: &SqlitePool,
) -> Result<Option<ExpressionOfInterest>, sqlx::Error> {
    sqlx::query_as!(
        ExpressionOfInterest,
        "SELECT id, collective_id, name, interest, context, referral, email, conflict_experience, participant_connections
        FROM entry_pathways
        WHERE auth_token = ? AND collective_id = ?",
        auth_token,
        collective_id.id
    )
    .fetch_optional(pool)
    .await
}

pub async fn find_all_entry_pathways_for_collective(
    collective_id: CollectiveId,
    pool: &SqlitePool,
) -> Result<Vec<EntryPathway>, sqlx::Error> {
    let eois = sqlx::query_as!(
        EntryPathway,
        "SELECT id, collective_id, name, interest, context, referral, conflict_experience, participant_connections FROM entry_pathways WHERE collective_id = ?",
        collective_id.id
    )
    .fetch_all(pool)
    .await?;

    Ok(eois)
}
