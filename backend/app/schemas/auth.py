from pydantic import BaseModel, ConfigDict


class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str


class SigninRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
