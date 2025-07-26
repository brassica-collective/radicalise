use utoipa_axum::router::OpenApiRouter;

pub fn private_api_router() -> OpenApiRouter {
    OpenApiRouter::new()
        .nest("/my_collective", crate::my_collective::router())
        .nest("/me", crate::me::router())
        .nest("/intervals", crate::intervals::router())
        .nest("/crews", crate::crews::router())
        .nest("/people", crate::people::router())
}

pub fn public_api_router() -> OpenApiRouter {
    OpenApiRouter::new().nest("/public", crate::public::router())
}
