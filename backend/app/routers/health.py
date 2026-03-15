from fastapi import APIRouter

from ..schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    from ..main import APP_VERSION
    return HealthResponse(status="ok", version=APP_VERSION)
