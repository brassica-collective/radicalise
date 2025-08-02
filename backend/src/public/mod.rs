use axum::{Extension, Json, extract::Path, http::StatusCode, response::IntoResponse};
use sqlx::SqlitePool;
use utoipa_axum::{router::OpenApiRouter, routes};

use crate::{my_collective::repo::find_collective_by_slug, shared::entities::Collective};

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new()
        .routes(routes!(get_collective_by_slug))
        .routes(routes!(crate::entry_pathways::create_eoi))
        .routes(routes!(crate::entry_pathways::update_eoi))
        .routes(routes!(crate::entry_pathways::delete_eoi))
        .routes(routes!(crate::entry_pathways::get_eoi_by_auth_token))
}

#[utoipa::path(get, path = "/collective/by_slug/{collective_slug}", responses(
        (status = 200, body = Collective),
        (status = NOT_FOUND, description = "Collective was not found", body = ()),
        (status = INTERNAL_SERVER_ERROR, description = "Internal server error", body = ()),
    ), params(
            ("collective_slug" = String, Path, description = "Collective slug")
        ),)]
async fn get_collective_by_slug(
    Path(collective_slug): Path<String>,
    Extension(pool): Extension<SqlitePool>,
) -> impl IntoResponse {
    let collective_result = find_collective_by_slug(collective_slug, &pool).await;

    match collective_result {
        Ok(collective) => (StatusCode::OK, Json(collective)).into_response(),
        Err(_) => (StatusCode::NOT_FOUND, ()).into_response(),
    }
}
