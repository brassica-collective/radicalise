use crate::auth::auth_routes::auth_router;

pub mod auth_backend;
mod auth_email;
mod auth_repo;
pub mod auth_routes;

pub fn router() -> utoipa_axum::router::OpenApiRouter {
    auth_router()
}
