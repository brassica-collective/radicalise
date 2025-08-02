use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use serde::Serialize;
use sqlx::SqlitePool;
use utoipa::ToSchema;

use crate::{
    entry_pathways::repo::find_eoi_by_auth_token,
    my_collective::repo::find_collective,
    realtime::RealtimeState,
    shared::{
        db_helpers::is_constraint_violation,
        entities::{CollectiveId, EntryPathway, ExpressionOfInterest},
        events::AppEvent,
    },
};

pub mod events;
pub mod repo;

#[derive(ToSchema, Debug, Serialize)]
enum EoiError {
    CollectiveNotFound,
    EoiNotFound,
    EoiFeatureDisabled,
    EmailAlreadyExists,
}

#[utoipa::path(
    post,
    path = "/eoi",
    responses(
        (status = 201, body = ()),
        (status = BAD_REQUEST, body = EoiError),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
    request_body(content = ExpressionOfInterest, content_type = "application/json")
)]
pub async fn create_eoi(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    axum::extract::Json(submission): axum::extract::Json<ExpressionOfInterest>,
) -> impl IntoResponse {
    println!("Creating EOI for details: {:?}", submission);

    let collective = match find_collective(CollectiveId::new(submission.collective_id), &pool).await
    {
        Ok(result) => result,
        Err(_) => {
            eprintln!("Collective not found for ID: {}", submission.collective_id);
            return (StatusCode::BAD_REQUEST, Json(EoiError::CollectiveNotFound)).into_response();
        }
    };

    if !collective.feature_eoi {
        return (StatusCode::BAD_REQUEST, Json(EoiError::EoiFeatureDisabled)).into_response();
    }

    match repo::create_eoi(submission, &pool).await {
        Ok(entry_pathway) => {
            broadcast_entry_pathway_updated(&entry_pathway, &realtime_state).await;
            return (StatusCode::CREATED, ()).into_response();
        }
        Err(e) => {
            if is_constraint_violation(&e) {
                return (StatusCode::BAD_REQUEST, Json(EoiError::EmailAlreadyExists))
                    .into_response();
            }

            eprintln!("Failed to create EOI: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
    .into_response()
}

#[utoipa::path(
    put,
    path = "/collective/{collective_id}/eoi/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway"),
        ("collective_id" = i64, Path, description = "Collective ID for the entry pathway")
    ),
    responses(
        (status = 200, body = ()),
        (status = BAD_REQUEST, body = EoiError),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
    request_body(content = ExpressionOfInterest, content_type = "application/json")
)]
pub async fn update_eoi(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    Path((collective_id, auth_token)): Path<(i64, String)>,
    Json(submission): Json<ExpressionOfInterest>,
) -> impl IntoResponse {
    println!("Updating EOI for details: {:?}", submission);

    let eoi = match find_eoi_by_auth_token(CollectiveId::new(collective_id), &auth_token, &pool)
        .await
    {
        Ok(Some(result)) => result,
        Ok(None) => return (StatusCode::BAD_REQUEST, Json(EoiError::EoiNotFound)).into_response(),
        Err(_) => return (StatusCode::BAD_REQUEST, Json(EoiError::EoiNotFound)).into_response(),
    };

    let record_to_write = ExpressionOfInterest {
        id: eoi.id,
        collective_id: eoi.collective_id,
        name: submission.name,
        email: submission.email,
        interest: submission.interest,
        context: submission.context,
        referral: submission.referral,
        conflict_experience: submission.conflict_experience,
        participant_connections: submission.participant_connections,
    };

    match repo::update_eoi(record_to_write, &pool).await {
        Ok(entry_pathway) => {
            broadcast_entry_pathway_updated(&entry_pathway, &realtime_state).await;
            return (StatusCode::OK, ()).into_response();
        }
        Err(e) => {
            if is_constraint_violation(&e) {
                return (StatusCode::BAD_REQUEST, Json(EoiError::EmailAlreadyExists))
                    .into_response();
            }

            eprintln!("Failed to create EOI: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, ())
        }
    }
    .into_response()
}

// REVIEW creation of new end point fn to delete EOI (uses simlar path parameters to the update endpoint fn). Not yet completed.
#[utoipa::path(
    delete,
    path = "/collective/{collective_id}/eoi/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway"),
        ("collective_id" = i64, Path, description = "Collective ID for the entry pathway")
    ),
    responses(
        (status = 200, body = ()),
        (status = BAD_REQUEST, body = EoiError),
        (status = INTERNAL_SERVER_ERROR, body = ()),
    ),
    request_body(content = ExpressionOfInterest, content_type = "application/json")
)]
pub async fn delete_eoi(
    Extension(pool): Extension<SqlitePool>,
    Extension(realtime_state): Extension<RealtimeState>,
    Path((collective_id, auth_token)): Path<(i64, String)>,
) -> impl IntoResponse {
    println!("Deleting EOI for collective ID: {}, auth token: {}", collective_id, auth_token);
    match repo::delete_eoi_record(&pool, auth_token, CollectiveId::new(collective_id)).await {
        Ok(_) => {
            return (StatusCode::OK, ()).into_response();
        }
        Err(e) => {
            eprintln!("Failed to delete EOI: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    }
    
}

//Get EOI by auth token

#[utoipa::path(
    get,
    path = "/collective/{collective_id}/interest/by_auth_token/{auth_token}",
    params(
        ("auth_token" = String, Path, description = "Authentication token for the entry pathway"),
        ("collective_id" = i64, Path, description = "Collective ID for the entry pathway")
    ),
    responses(
        (status = OK, body = ExpressionOfInterest),
        (status = NOT_FOUND, description = "Entry pathway not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ())
    ),
)]
pub async fn get_eoi_by_auth_token(
    Path((collective_id, auth_token)): Path<(i64, String)>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let result = find_eoi_by_auth_token(CollectiveId::new(collective_id), &auth_token, &pool).await;
    match result {
        Ok(Some(eoi)) => {
            return (StatusCode::OK, Json(eoi)).into_response();
        }
        Ok(None) => {
            println!("No entry pathway found for auth token: {}", auth_token);
            return (StatusCode::NOT_FOUND, ()).into_response();
        }
        Err(e) => {
            eprintln!("Failed to find entry pathway by auth token: {}", e);
            return (StatusCode::INTERNAL_SERVER_ERROR, ()).into_response();
        }
    }
}

// Private function to broadcast entry pathway updates

async fn broadcast_entry_pathway_updated(
    entry_pathway: &EntryPathway,
    realtime_state: &RealtimeState,
) {
    let event = events::EntryPathwayEvent::EntryPathwayUpdated(entry_pathway.clone());
    realtime_state
        .broadcast_app_event(None, AppEvent::EntryPathwayEvent(event))
        .await;
}
