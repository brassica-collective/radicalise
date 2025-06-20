use axum::{Extension, routing::get};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;

use crate::{database::prepare_database, static_server::frontend_handler};

mod auth;
mod controllers;
mod database;
mod entities;
mod static_server;

#[macro_use]
extern crate lazy_static;

#[tokio::main]
async fn main() {
    #[derive(OpenApi)]
    #[openapi()]
    struct ApiDoc;

    let cors = CorsLayer::new().allow_origin(Any); // Allow all origins (open policy)

    let pool = prepare_database()
        .await
        .expect("Failed to prepare database");

    let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
        .nest("/api", crate::controllers::router())
        .split_for_parts();

    let router = router
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", api.clone()))
        .fallback_service(get(frontend_handler))
        .layer(cors)
        .layer(Extension(pool));

    let app = router.into_make_service();

    // run our app with hyper, listening globally on port 8000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();

    println!("Listening on http://localhost:8000, Ctrl+C to stop");

    axum::serve(listener, app).await.unwrap();
}
