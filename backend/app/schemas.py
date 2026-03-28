from datetime import datetime

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class GroupRead(BaseModel):
    id: int
    name: str
    created_at: datetime


class GroupOwnerRead(BaseModel):
    id: int
    owner_name: str
    owner_phone: str | None
    source_type: str
    file_name: str
    uploaded_at: datetime
    record_count: int


class UploadFileResult(BaseModel):
    file_name: str
    owner_name: str
    source_type: str
    inserted_records: int


class UploadSummary(BaseModel):
    group_id: int
    processed_files: int
    inserted_records: int
    files: list[UploadFileResult]


class CompareRecordRead(BaseModel):
    id: int
    full_name: str | None
    birth_date: str | None
    phone: str
    province: str | None
    city_county: str | None
    district: str | None
    dong: str | None
    address_detail: str | None
    created_at: datetime
    updated_at: datetime


class CompareRecordListRead(BaseModel):
    total: int
    dong_count: int
    page: int
    page_size: int
    latest_updated_at: datetime | None
    refreshed_at: datetime | None
    items: list[CompareRecordRead]


class CompareUploadSummary(BaseModel):
    processed_files: int
    rows_read: int
    inserted: int
    updated: int
    skipped_no_phone: int
    invalid_count: int
    error_batch_id: str | None


class SupporterUploadSyncSummary(BaseModel):
    mode: str = "sync"
    rows_read: int
    inserted: int
    skipped_duplicate: int
    invalid_count: int


class SupporterUploadAsyncQueued(BaseModel):
    mode: str = "async"
    job_id: str
    status: str
    total_rows: int


class SupporterStatsSummaryRead(BaseModel):
    total_supporters: int
    today_added_supporters: int
    compare_matched_with_address: int
    refreshed_at: datetime


class SupporterListItemRead(BaseModel):
    id: int
    supporter_name: str | None
    phone: str
    compare_full_name: str | None
    city_county: str | None
    district: str | None
    dong: str | None
    address_detail: str | None
    created_at: datetime


class SupporterListRead(BaseModel):
    scope: str
    total: int
    page: int
    page_size: int
    refreshed_at: datetime
    items: list[SupporterListItemRead]


class StatsSummaryRead(BaseModel):
    total_managers: int
    today_representatives: int
    today_added_managers: int
    favorite_contacts: int
    total_contacts: int
    unified_total_people: int
    unified_matched_with_address: int
    refreshed_at: datetime


class UnifiedContactListItemRead(BaseModel):
    phone: str
    person_name: str | None
    supporter_name: str | None
    source: str
    city_county: str | None
    district: str | None
    dong: str | None
    address_detail: str | None
    created_at: datetime


class UnifiedContactListRead(BaseModel):
    scope: str
    total: int
    page: int
    page_size: int
    refreshed_at: datetime
    items: list[UnifiedContactListItemRead]


class DailyStatsRead(BaseModel):
    stat_date: str
    representatives_added: int
    managers_added: int
    favorite_contacts_added: int
    contacts_added: int


class TodayManagerRead(BaseModel):
    owner_id: int
    group_name: str
    owner_name: str
    contacts_count: int
    favorite_contacts_count: int
    called_count: int
    party_member_count: int
    uploaded_at: datetime


class ContactCategoryRead(BaseModel):
    name: str
    count: int


class ContactListItemRead(BaseModel):
    phone_normalized: str
    phone: str
    name: str | None
    city_county: str | None
    dong: str | None
    address_detail: str | None
    owner_primary_name: str | None
    owner_count: int
    created_at: datetime


class ContactListRead(BaseModel):
    total: int
    page: int
    page_size: int
    city_categories: list[ContactCategoryRead]
    dong_categories: list[ContactCategoryRead]
    items: list[ContactListItemRead]


class ElectionDistrictRead(BaseModel):
    name: str
    count: int
    dongs: list[str]


class ElectionContactsRead(BaseModel):
    total: int
    page: int
    page_size: int
    districts: list[ElectionDistrictRead]
    unknown_count: int
    city_categories: list[ContactCategoryRead]
    dong_categories: list[ContactCategoryRead]
    items: list[ContactListItemRead]


class ElectionDongAddRequest(BaseModel):
    dong: str = Field(min_length=1, max_length=100)


class ContactOwnerRead(BaseModel):
    id: int
    owner_name: str
    owner_phone: str | None
    group_name: str
    source_type: str
    file_name: str
    uploaded_at: datetime
    contact_record_count: int


class OwnerRecordRead(BaseModel):
    id: int
    person_name: str | None
    phone: str | None
    province: str | None = None
    city_county: str | None = None
    district: str | None = None
    dong: str | None = None
    address_detail: str | None = None
    intimacy_checked: bool | None
    called: bool | None
    party_member: bool | None
    created_at: datetime


class OwnerDetailRead(BaseModel):
    id: int
    group_name: str
    owner_name: str
    owner_phone: str | None
    source_type: str
    file_name: str
    uploaded_at: datetime
    records: list[OwnerRecordRead]


class TreeOwnerNodeRead(BaseModel):
    owner_id: int
    owner_name: str
    contacts_count: int
    favorite_contacts_count: int
    called_count: int
    party_member_count: int
    highlight_blue: bool = False


class TreeGroupNodeRead(BaseModel):
    group_id: int
    group_name: str
    children_total_contacts_count: int
    children_total_favorite_contacts_count: int
    children_total_called_count: int
    children_total_party_member_count: int
    ambiguous_self_children: bool = False
    children: list[TreeOwnerNodeRead]


class ItemCreate(BaseModel):
    name: str


class ItemRead(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True
