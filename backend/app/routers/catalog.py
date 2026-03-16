from fastapi import APIRouter

from ..schemas.catalog import CatalogResponse
from ..registry.document_registry import list_types

router = APIRouter(prefix="/catalog")


@router.get("", response_model=CatalogResponse)
def get_catalog() -> CatalogResponse:
    return CatalogResponse(items=list_types())
