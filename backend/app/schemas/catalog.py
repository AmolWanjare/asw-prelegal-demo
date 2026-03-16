from pydantic import BaseModel


class CatalogItem(BaseModel):
    slug: str
    display_name: str
    description: str
    filename: str


class CatalogResponse(BaseModel):
    items: list[CatalogItem]
