import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STORAGE_KEY = "docdiff_token";

const VIEW_TO_HASH = {
  main: "#main",
  home: "#home",
  supporter: "#supporter",
  form: "#form",
  acquaintanceStats: "#acquaintance-stats",
  stats: "#stats",
  combinedContacts: "#combined-contacts",
  dailyDetail: "#daily-detail",
  todayManagers: "#today-managers",
  tree: "#tree",
  treeOwnerContacts: "#tree-owner-contacts",
  compare: "#compare",
  contacts: "#contacts",
  electionContacts: "#election-contacts",
  owner: "#owner",
  jeonju: "#jeonju",
};

const HASH_TO_VIEW = {
  "#main": "main",
  "#home": "home",
  "#supporter": "supporter",
  "#form": "form",
  "#acquaintance-stats": "acquaintanceStats",
  "#stats": "stats",
  "#combined-contacts": "combinedContacts",
  "#daily-detail": "dailyDetail",
  "#today-managers": "todayManagers",
  "#tree": "tree",
  "#tree-owner-contacts": "treeOwnerContacts",
  "#compare": "compare",
  "#contacts": "contacts",
  "#election-contacts": "electionContacts",
  "#owner": "owner",
  "#jeonju": "jeonju",
};

function normalizeTableSearchValue(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function rowMatchesTableSearch(query, values) {
  const needle = normalizeTableSearchValue(query);
  if (!needle) return true;
  return values.some((value) => normalizeTableSearchValue(value).includes(needle));
}

function TableSearchBar({ value, onChange, placeholder = "테이블 검색" }) {
  return (
    <div className="table-search-bar">
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function HomePanel({ onOpenForm, onOpenStats, onOpenTree, onOpenCompare, onOpenJeonju, onBackToMain }) {
  return (
    <section>
      <div className="main-actions">
        <button type="button" onClick={onOpenForm}>
          데이터 추가하기
        </button>
        <button type="button" onClick={onOpenCompare}>
          비교군 추가하기
        </button>
        <button type="button" onClick={onOpenStats}>
          통계보기
        </button>
        <button type="button" onClick={onOpenTree}>
          트리보기
        </button>
        <button type="button" onClick={onOpenJeonju}>
          전주시 데이터
        </button>
      </div>
      <button type="button" className="secondary-btn" onClick={onBackToMain}>
        메인화면으로
      </button>
    </section>
  );
}

function MainRootPanel({ onOpenAcquaintance, onOpenSupporter, onOpenOverallStats }) {
  return (
    <section className="main-category-actions">
      <button type="button" onClick={onOpenAcquaintance}>
        지인
      </button>
      <button type="button" onClick={onOpenSupporter}>
        서포터
      </button>
      <button type="button" onClick={onOpenOverallStats}>
        전체통계
      </button>
    </section>
  );
}

const JEONJU_CATEGORIES = [
  { key: "all", label: "전주시 전체" },
  { key: "gap", label: "전주시 갑" },
  { key: "eul", label: "전주시 을" },
  { key: "byeong", label: "전주시 병" },
];

function SupporterPanel({
  loading,
  supporterView,
  setSupporterView,
  setSupporterFile,
  supporterMessage,
  supporterUploadJob,
  supporterStats,
  supporterListData,
  supporterListScope,
  supporterFilter,
  electionDistrictMap,
  onUploadSupporters,
  onDownloadSupporterTemplate,
  onRefreshSupporterStats,
  onOpenSupporterList,
  onSelectSupporterFilter,
  onPageMoveSupporterList,
  onDownloadSupporterListExcel,
  onClose,
}) {
  const [tableSearch, setTableSearch] = useState("");
  const progressPercent =
    supporterUploadJob && supporterUploadJob.total_rows
      ? Math.min(100, Math.floor((supporterUploadJob.processed_rows / supporterUploadJob.total_rows) * 100))
      : 0;
  const totalSupporterPages = Math.max(1, Math.ceil((supporterListData.total || 0) / (supporterListData.page_size || 100)));
  const supporterListTitle =
    supporterListScope === "matched" ? "비교군 매칭 리스트(주소 있음)" : "총 서포터 리스트";
  const filteredSupporterItems = supporterListData.items.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.supporter_name,
      row.phone,
      row.compare_full_name,
      row.city_county,
      row.district,
      row.dong,
      row.address_detail,
      row.created_at,
    ])
  );

  return (
    <section className="supporter-actions">
      <h2>서포터 비교</h2>
      <div className="main-actions">
        <button
          type="button"
          className={supporterView === "upload" ? "chip-btn active" : "chip-btn"}
          onClick={() => setSupporterView("upload")}
        >
          데이터 추가하기
        </button>
        <button
          type="button"
          className={supporterView === "stats" ? "chip-btn active" : "chip-btn"}
          onClick={() => setSupporterView("stats")}
        >
          통계보기
        </button>
      </div>

      {supporterView === "upload" ? (
        <>
          <button type="button" className="download-link-btn" onClick={onDownloadSupporterTemplate}>
            샘플 엑셀 다운로드
          </button>
          <form onSubmit={onUploadSupporters} className="upload-form">
            <label className="file-input-wrap">
              서포터 엑셀 업로드 (.xlsx, 1열 이름 / 2열 전화번호)
              <input
                type="file"
                accept=".xlsx"
                onChange={(event) => setSupporterFile(event.target.files?.[0] || null)}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "업로드 중..." : "서포터 업로드"}
            </button>
          </form>
          {supporterUploadJob ? (
            <div className="upload-progress">
              <p className="hint">
                업로드 작업 상태: {supporterUploadJob.status} ({supporterUploadJob.processed_rows || 0}/
                {supporterUploadJob.total_rows || 0})
              </p>
              <div className="progress-bar">
                <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }} />
              </div>
              {supporterUploadJob.error ? <p className="error">오류: {supporterUploadJob.error}</p> : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="table-toolbar">
            <button type="button" className="download-link-btn" onClick={onRefreshSupporterStats}>
              새로고침
            </button>
          </div>
          <div className="stats-cards">
            <button
              type="button"
              className="stats-card stats-card-button"
              onClick={() => onOpenSupporterList("total")}
              disabled={(supporterStats.total_supporters || 0) === 0}
              aria-expanded={supporterListScope === "total" && supporterListData.total > 0}
              aria-controls="supporter-records-table"
            >
              <strong>총 서포터 인원</strong>
              <span>{supporterStats.total_supporters || 0}</span>
            </button>
            <div className="stats-card">
              <strong>오늘 추가된 서포터</strong>
              <span>{supporterStats.today_added_supporters || 0}</span>
            </div>
            <button
              type="button"
              className="stats-card stats-card-button"
              onClick={() => onOpenSupporterList("matched")}
              disabled={(supporterStats.compare_matched_with_address || 0) === 0}
              aria-expanded={supporterListScope === "matched" && supporterListData.total > 0}
              aria-controls="supporter-records-table"
            >
              <strong>비교군 매칭(주소 있음)</strong>
              <span>{supporterStats.compare_matched_with_address || 0}</span>
            </button>
          </div>
          <p className="hint">
            기준시각: {supporterStats.refreshed_at ? new Date(supporterStats.refreshed_at).toLocaleString() : "-"}
          </p>
          <div className="district-download-group">
            <p className="hint">카테고리 선택</p>
            <div className="district-download-buttons">
              <button
                type="button"
                className={`chip-btn ${supporterFilter.type === "all" ? "active" : ""}`}
                onClick={() => onSelectSupporterFilter({ type: "all", value: "", label: "전체" })}
              >
                전체
              </button>
              {Object.keys(electionDistrictMap).map((districtName) => (
                <button
                  key={districtName}
                  type="button"
                  className={`chip-btn ${supporterFilter.type === "district" && supporterFilter.value === districtName ? "active" : ""}`}
                  onClick={() => onSelectSupporterFilter({ type: "district", value: districtName, label: districtName })}
                >
                  {districtName}
                </button>
              ))}
            </div>
            <p className="hint">동 카테고리</p>
            <div className="district-download-buttons">
              <button
                type="button"
                className={`chip-btn ${supporterFilter.type === "keyword" && supporterFilter.value === "효자동" ? "active" : ""}`}
                onClick={() => onSelectSupporterFilter({ type: "keyword", value: "효자동", label: "효자동 전체" })}
              >
                효자동 전체
              </button>
              <button
                type="button"
                className={`chip-btn ${supporterFilter.type === "keyword" && supporterFilter.value === "송천동" ? "active" : ""}`}
                onClick={() => onSelectSupporterFilter({ type: "keyword", value: "송천동", label: "송천동 전체" })}
              >
                송천동 전체
              </button>
            </div>
            {supporterFilter.type !== "all" ? <p className="hint">선택된 카테고리: {supporterFilter.label}</p> : null}
          </div>
          {supporterListData.total > 0 ? (
            <>
              <div className="table-toolbar">
                <button type="button" className="download-link-btn" onClick={onDownloadSupporterListExcel}>
                  선택 리스트 엑셀 다운로드
                </button>
              </div>
              <p className="hint">
                {supporterListTitle} / 총 {supporterListData.total.toLocaleString()}건 / {supporterListData.page}페이지 / 기준시각{" "}
                {supporterListData.refreshed_at ? new Date(supporterListData.refreshed_at).toLocaleString() : "-"}
              </p>
              <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="서포터 테이블 검색" />
              <div className="table-wrap" id="supporter-records-table">
                <table>
                  <thead>
                    <tr>
                      <th>서포터명</th>
                      <th>연락처</th>
                      <th>비교군 성명</th>
                      <th>시(군)</th>
                      <th>구</th>
                      <th>동</th>
                      <th>주소(상세)</th>
                      <th>등록시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupporterItems.length > 0 ? (
                      filteredSupporterItems.map((row) => (
                        <tr key={row.id}>
                          <td>{row.supporter_name || "-"}</td>
                          <td>{row.phone}</td>
                          <td>{row.compare_full_name || "-"}</td>
                          <td>{row.city_county || "-"}</td>
                          <td>{row.district || "-"}</td>
                          <td>{row.dong || "-"}</td>
                          <td>{row.address_detail || "-"}</td>
                          <td>{new Date(row.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>표시할 서포터 데이터가 없습니다.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pagination-wrap">
                <button
                  type="button"
                  onClick={() => onPageMoveSupporterList(supporterListData.page - 1)}
                  disabled={supporterListData.page <= 1}
                >
                  이전
                </button>
                <span>
                  {supporterListData.page} / {totalSupporterPages}
                </span>
                <button
                  type="button"
                  onClick={() => onPageMoveSupporterList(supporterListData.page + 1)}
                  disabled={supporterListData.page >= totalSupporterPages}
                >
                  다음
                </button>
              </div>
            </>
          ) : null}
          {supporterListData.total === 0 && supporterView === "stats" ? (
            <p className="hint">총 서포터 인원 또는 비교군 매칭 카드를 눌러 리스트를 확인하세요.</p>
          ) : null}
        </>
      )}

      {supporterMessage ? <p className="hint">{supporterMessage}</p> : null}
      <button type="button" className="secondary-btn" onClick={onClose}>
        메인으로 돌아가기
      </button>
    </section>
  );
}

function UploadPanel({
  loading,
  groups,
  selectedGroupId,
  setSelectedGroupId,
  newGroupName,
  setNewGroupName,
  setUploadFiles,
  onCreateGroup,
  onUpload,
  formMessage,
  uploadJob,
  onCloseForm,
}) {
  const progressPercent =
    uploadJob && uploadJob.total_files
      ? Math.min(100, Math.floor((uploadJob.processed_files / uploadJob.total_files) * 100))
      : 0;

  return (
    <section>
      <h2>데이터 추가하기</h2>

      <form onSubmit={onCreateGroup} className="create-group-form">
        <input
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value)}
          placeholder="새 그룹 이름"
        />
        <button type="submit" disabled={loading}>
          그룹 만들기
        </button>
      </form>

      <form onSubmit={onUpload} className="upload-form">
        <div className="group-select-wrap">
          <label>업로드 대상 그룹</label>
          <select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
            <option value="">그룹 선택</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <label className="file-input-wrap">
          PDF/XLSX 파일 (복수 선택 가능)
          <input
            type="file"
            multiple
            accept=".pdf,.xlsx"
            onChange={(event) => setUploadFiles(Array.from(event.target.files || []))}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "업로드 중..." : "데이터 업로드"}
        </button>
      </form>

      {formMessage ? <p className="hint">{formMessage}</p> : null}
      {uploadJob ? (
        <div className="upload-progress">
          <p className="hint">
            업로드 작업 상태: {uploadJob.status} ({uploadJob.processed_files || 0}/{uploadJob.total_files || 0})
          </p>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${progressPercent}%` }} />
          </div>
          {uploadJob.current_file ? <p className="hint">현재 처리 파일: {uploadJob.current_file}</p> : null}
          {uploadJob.error ? <p className="error">오류: {uploadJob.error}</p> : null}
        </div>
      ) : null}

      <button type="button" className="secondary-btn" onClick={onCloseForm}>
        메인으로 돌아가기
      </button>
    </section>
  );
}

function StatsPanel({
  summary,
  showUnifiedCards = true,
  overallOnly = false,
  overallListScope = "",
  overallListData,
  combinedContactsFilter,
  electionDistrictMap,
  combinedContactsCategoryCounts,
  isDailyOpen,
  dailyRows,
  onToggleDaily,
  onDownloadDailyExcel,
  onOpenCombinedTotal,
  onOpenCombinedMatched,
  onSelectCombinedContactsFilter,
  onPageMoveCombinedContacts,
  onDownloadCombinedContactsExcel,
  onOpenContacts,
  onOpenFavoriteContacts,
  onOpenTodayManagers,
  onOpenDailyDetail,
  onClose,
}) {
  const [tableSearch, setTableSearch] = useState("");
  const filteredDailyRows = dailyRows.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.stat_date,
      row.representatives_added,
      row.managers_added,
      row.favorite_contacts_added,
      row.contacts_added,
    ])
  );
  return (
    <section>
      <div className="stats-header">
        <h2>통계보기</h2>
        {!overallOnly ? (
          <button type="button" className="download-link-btn" onClick={onToggleDaily}>
            {isDailyOpen ? "날짜별 통계 숨기기" : "날짜별 통계보기"}
          </button>
        ) : null}
      </div>

      <div className="stats-cards">
        {overallOnly ? (
          <>
            <button type="button" className="stats-card stats-card-button" onClick={onOpenCombinedTotal}>
              <strong>총 지인+서포터 인원(중복제거)</strong>
              <span>{summary.unified_total_people}</span>
            </button>
            <button type="button" className="stats-card stats-card-button" onClick={onOpenCombinedMatched}>
              <strong>비교군 매칭 인원(중복제거)</strong>
              <span>{summary.unified_matched_with_address}</span>
            </button>
          </>
        ) : (
          <>
            <div className="stats-card">
              <strong>총 관리인원</strong>
              <span>{summary.total_managers}</span>
            </div>
            <div className="stats-card">
              <strong>오늘 등록한 대표인원</strong>
              <span>{summary.today_representatives}</span>
            </div>
            <button type="button" className="stats-card stats-card-button" onClick={onOpenTodayManagers}>
              <strong>오늘 추가된 관리인원</strong>
              <span>{summary.today_added_managers}</span>
            </button>
            <button type="button" className="stats-card stats-card-button" onClick={onOpenFavoriteContacts}>
              <strong>찜한 연락처 수</strong>
              <span>{summary.favorite_contacts}</span>
            </button>
            {showUnifiedCards ? (
              <button type="button" className="stats-card stats-card-button" onClick={onOpenCombinedTotal}>
                <strong>총 지인+서포터 인원(중복제거)</strong>
                <span>{summary.unified_total_people}</span>
              </button>
            ) : null}
            {showUnifiedCards ? (
              <button type="button" className="stats-card stats-card-button" onClick={onOpenCombinedMatched}>
                <strong>비교군 매칭 인원(중복제거)</strong>
                <span>{summary.unified_matched_with_address}</span>
              </button>
            ) : null}
            <button type="button" className="stats-card stats-card-button" onClick={onOpenContacts}>
              <strong>총 지인 연락처 수(기존)</strong>
              <span>{summary.total_contacts}</span>
            </button>
          </>
        )}
      </div>

      <p className="hint">기준시각: {summary.refreshed_at ? new Date(summary.refreshed_at).toLocaleString() : "-"}</p>

      {overallOnly && overallListScope ? (
        <CombinedContactsPanel
          data={overallListData}
          scope={overallListScope}
          combinedContactsFilter={combinedContactsFilter}
          electionDistrictMap={electionDistrictMap}
          combinedContactsCategoryCounts={combinedContactsCategoryCounts}
          onSelectCombinedContactsFilter={onSelectCombinedContactsFilter}
          onPageMove={onPageMoveCombinedContacts}
          onDownloadExcel={onDownloadCombinedContactsExcel}
          onBackToStats={null}
          onClose={null}
        />
      ) : null}

      {!overallOnly && isDailyOpen ? (
        <section className="daily-stats-wrap">
          <button type="button" className="download-link-btn" onClick={onDownloadDailyExcel}>
            엑셀 다운로드
          </button>
          <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="날짜별 통계 검색" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>추가된 대표인원</th>
                  <th>추가된 관리인원</th>
                  <th>추가된 찜한 연락처 수</th>
                  <th>추가된 지인 연락처 수</th>
                </tr>
              </thead>
              <tbody>
                {filteredDailyRows.map((row) => (
                  <tr key={row.stat_date}>
                    <td>{row.stat_date}</td>
                    <td>{row.representatives_added}</td>
                    <td>
                      {row.managers_added > 0 ? (
                        <button
                          type="button"
                          className="inline-link-btn"
                          onClick={() => onOpenDailyDetail(row.stat_date, "managers")}
                        >
                          {row.managers_added}
                        </button>
                      ) : (
                        row.managers_added
                      )}
                    </td>
                    <td>
                      {row.favorite_contacts_added > 0 ? (
                        <button
                          type="button"
                          className="inline-link-btn"
                          onClick={() => onOpenDailyDetail(row.stat_date, "favorites")}
                        >
                          {row.favorite_contacts_added}
                        </button>
                      ) : (
                        row.favorite_contacts_added
                      )}
                    </td>
                    <td>
                      {row.contacts_added > 0 ? (
                        <button
                          type="button"
                          className="inline-link-btn"
                          onClick={() => onOpenDailyDetail(row.stat_date, "contacts")}
                        >
                          {row.contacts_added}
                        </button>
                      ) : (
                        row.contacts_added
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <button type="button" className="secondary-btn" onClick={onClose}>
        메인으로 돌아가기
      </button>
    </section>
  );
}

function CombinedContactsPanel({
  data,
  scope,
  combinedContactsFilter,
  electionDistrictMap,
  combinedContactsCategoryCounts,
  onSelectCombinedContactsFilter,
  onPageMove,
  onDownloadExcel,
  onBackToStats,
  onClose,
}) {
  const [tableSearch, setTableSearch] = useState("");
  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.page_size || 100)));
  const title = scope === "matched" ? "비교군 매칭 인원 리스트" : "총 지인+서포터 인원 리스트";
  const filteredItems = data.items.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.phone,
      row.person_name,
      row.supporter_name,
      row.source,
      row.city_county,
      row.district,
      row.dong,
      row.address_detail,
      row.created_at,
    ])
  );

  return (
    <section>
      <div className="stats-header">
        <h2>{title}</h2>
        <button type="button" className="download-link-btn" onClick={onDownloadExcel}>
          엑셀 다운로드
        </button>
      </div>
      <p className="hint">
        총 {data.total}건 / {data.page}페이지 / 기준시각{" "}
        {data.refreshed_at ? new Date(data.refreshed_at).toLocaleString() : "-"}
      </p>
      {scope === "matched" ? (
        <div className="district-download-group">
          <p className="hint">선거구 선택</p>
          <div className="district-download-buttons">
            <button
              type="button"
              className={`chip-btn ${combinedContactsFilter.type === "all" ? "active" : ""}`}
              onClick={() => onSelectCombinedContactsFilter({ type: "all", value: "", label: "전체" })}
            >
              전체 ({data.total})
            </button>
            {Object.keys(electionDistrictMap).map((districtName) => (
              <button
                key={districtName}
                type="button"
                className={`chip-btn ${combinedContactsFilter.type === "district" && combinedContactsFilter.value === districtName ? "active" : ""}`}
                onClick={() => onSelectCombinedContactsFilter({ type: "district", value: districtName, label: districtName })}
              >
                {districtName} ({combinedContactsCategoryCounts[`district:${districtName}`] || 0})
              </button>
            ))}
          </div>
          <p className="hint">동 카테고리</p>
          <div className="district-download-buttons">
            <button
              type="button"
              className={`chip-btn ${combinedContactsFilter.type === "keyword" && combinedContactsFilter.value === "효자동" ? "active" : ""}`}
              onClick={() => onSelectCombinedContactsFilter({ type: "keyword", value: "효자동", label: "효자동 전체" })}
            >
              효자동 전체 ({combinedContactsCategoryCounts["keyword:효자동"] || 0})
            </button>
            <button
              type="button"
              className={`chip-btn ${combinedContactsFilter.type === "keyword" && combinedContactsFilter.value === "송천동" ? "active" : ""}`}
              onClick={() => onSelectCombinedContactsFilter({ type: "keyword", value: "송천동", label: "송천동 전체" })}
            >
              송천동 전체 ({combinedContactsCategoryCounts["keyword:송천동"] || 0})
            </button>
          </div>
          {combinedContactsFilter.type !== "all" ? <p className="hint">선택된 카테고리: {combinedContactsFilter.label}</p> : null}
        </div>
      ) : null}
      <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="통합 연락처 검색" />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>연락처</th>
              <th>지인 이름</th>
              <th>서포터 이름</th>
              <th>출처</th>
              <th>시(군)</th>
              <th>구</th>
              <th>동</th>
              <th>주소(상세)</th>
              <th>등록시각</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((row, idx) => (
                <tr key={row.phone || `combined-${idx}`}>
                  <td>{row.phone || "-"}</td>
                  <td>{row.person_name || "-"}</td>
                  <td>{row.supporter_name || "-"}</td>
                  <td>{row.source === "acquaintance" ? "지인" : "서포터"}</td>
                  <td>{row.city_county || "-"}</td>
                  <td>{row.district || "-"}</td>
                  <td>{row.dong || "-"}</td>
                  <td>{row.address_detail || "-"}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>표시할 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-wrap">
        <button type="button" onClick={() => onPageMove(data.page - 1)} disabled={data.page <= 1}>
          이전
        </button>
        <span>
          {data.page} / {totalPages}
        </span>
        <button type="button" onClick={() => onPageMove(data.page + 1)} disabled={data.page >= totalPages}>
          다음
        </button>
      </div>

      {onBackToStats ? (
        <button type="button" className="secondary-btn" onClick={onBackToStats}>
          통계보기로
        </button>
      ) : null}
      {onClose ? (
        <button type="button" className="secondary-btn" onClick={onClose}>
          메인으로 돌아가기
        </button>
      ) : null}
    </section>
  );
}

function DailyDetailPanel({ detail, loading, error, onBackToStats, onClose }) {
  const [tableSearch, setTableSearch] = useState("");
  const metricLabelMap = {
    representatives: "추가된 대표인원",
    managers: "추가된 관리인원",
    favorites: "추가된 찜한 연락처",
    contacts: "추가된 지인 연락처",
  };
  const metricLabel = metricLabelMap[detail.metric] || detail.metric;
  const filteredRows = detail.rows.filter((row) =>
    rowMatchesTableSearch(
      tableSearch,
      detail.metric === "representatives"
        ? [row.id, row.name, row.created_at]
        : detail.metric === "managers"
          ? [row.group_name, row.owner_name, row.contacts_count, row.favorite_contacts_count, row.called_count, row.party_member_count, row.uploaded_at]
          : [row.person_name, row.phone, row.city_county, row.dong, row.address_detail]
    )
  );

  return (
    <section>
      <h2>날짜별 통계 상세</h2>
      <p className="hint">
        날짜: {detail.stat_date || "-"} / 항목: {metricLabel} / 건수: {detail.count || 0}
      </p>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="hint">불러오는 중...</p> : null}
      {!loading ? (
        <>
        <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="상세 테이블 검색" />
        <div className="table-wrap">
          <table>
            <thead>
              {detail.metric === "representatives" ? (
                <tr>
                  <th>ID</th>
                  <th>대표명(그룹명)</th>
                  <th>등록시각</th>
                </tr>
              ) : detail.metric === "managers" ? (
                <tr>
                  <th>그룹</th>
                  <th>성명</th>
                  <th>지인</th>
                  <th>찜</th>
                  <th>전화</th>
                  <th>당원체크</th>
                  <th>추가시각</th>
                </tr>
              ) : (
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>시(군)</th>
                  <th>동</th>
                  <th>주소(상세)</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) =>
                  detail.metric === "representatives" ? (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.name}</td>
                      <td>{new Date(row.created_at).toLocaleString()}</td>
                    </tr>
                  ) : detail.metric === "managers" ? (
                    <tr key={row.owner_id}>
                      <td>{row.group_name}</td>
                      <td>{row.owner_name}</td>
                      <td>{row.contacts_count}</td>
                      <td>{row.favorite_contacts_count}</td>
                      <td>{row.called_count}</td>
                      <td>{row.party_member_count}</td>
                      <td>{new Date(row.uploaded_at).toLocaleString()}</td>
                    </tr>
                  ) : (
                    <tr key={row.phone_normalized || `${row.phone}-${idx}`}>
                      <td>{row.person_name || "-"}</td>
                      <td>{row.phone || "-"}</td>
                      <td>{row.city_county || "-"}</td>
                      <td>{row.dong || "-"}</td>
                      <td>{row.address_detail || "-"}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan={detail.metric === "representatives" ? 3 : detail.metric === "managers" ? 7 : 5}>
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      ) : null}

      <div className="panel-actions">
        <button type="button" className="secondary-btn" onClick={onBackToStats}>
          통계보기로
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          메인으로 돌아가기
        </button>
      </div>
    </section>
  );
}

function TodayManagersPanel({ rows, onClose, onBackToStats }) {
  const [tableSearch, setTableSearch] = useState("");
  const filteredRows = rows.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.group_name,
      row.owner_name,
      row.contacts_count,
      row.favorite_contacts_count,
      row.called_count,
      row.party_member_count,
      row.uploaded_at,
    ])
  );
  return (
    <section>
      <h2>오늘 추가된 관리인원</h2>
      <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="관리인원 검색" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>그룹</th>
              <th>성명</th>
              <th>지인</th>
              <th>찜</th>
              <th>전화</th>
              <th>당원체크</th>
              <th>추가시각</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr key={row.owner_id}>
                  <td>{row.group_name}</td>
                  <td>{row.owner_name}</td>
                  <td>{row.contacts_count}</td>
                  <td>{row.favorite_contacts_count}</td>
                  <td>{row.called_count}</td>
                  <td>{row.party_member_count}</td>
                  <td>{new Date(row.uploaded_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>오늘 추가된 관리인원이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel-actions">
        <button type="button" className="secondary-btn" onClick={onBackToStats}>
          통계보기로
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          메인으로 돌아가기
        </button>
      </div>
    </section>
  );
}

function TreePanel({
  treeRows,
  onSelectTreeOwner,
  onDeleteTreeOwner,
  onClose,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <section>
      <h2>트리보기</h2>
      {treeRows.length === 0 ? <p className="hint">표시할 그룹/데이터가 없습니다.</p> : null}

      <div className="tree-wrap">
        {treeRows.map((group) => {
          const isExpanded = !!expandedGroups[group.group_id];
          return (
            <article key={group.group_id} className="tree-group-card">
              <header className="tree-group-header">
                <div className="tree-group-top">
                  <h3>{group.group_name}</h3>
                  <button type="button" className="download-link-btn" onClick={() => toggleGroup(group.group_id)}>
                    {isExpanded ? "자식 노드 숨기기" : "자식 노드 보기"}
                  </button>
                </div>
                <div className="tree-summary-grid">
                  <div className="tree-summary-metric">
                    <strong>총 지인</strong>
                    <span>{group.children_total_contacts_count}</span>
                  </div>
                  <div className="tree-summary-metric">
                    <strong>총 찜</strong>
                    <span>{group.children_total_favorite_contacts_count}</span>
                  </div>
                  <div className="tree-summary-metric">
                    <strong>총 전화</strong>
                    <span>{group.children_total_called_count}</span>
                  </div>
                  <div className="tree-summary-metric">
                    <strong>총 당원체크</strong>
                    <span>{group.children_total_party_member_count}</span>
                  </div>
                </div>
              </header>
              {isExpanded ? (
                <ul className="tree-child-list">
                  {group.children.map((child) => (
                    <li
                      key={child.owner_id}
                      className={child.highlight_blue ? "tree-child-item tree-child-item-blue" : "tree-child-item"}
                    >
                      <div className="tree-child-top">
                        <button
                          type="button"
                          className="tree-node-btn"
                          onClick={() => onSelectTreeOwner(child.owner_id)}
                        >
                          <strong>{child.owner_name}</strong>
                        </button>
                        <button
                          type="button"
                          className="dong-remove-btn"
                          onClick={() => onDeleteTreeOwner(child.owner_id, child.owner_name)}
                        >
                          삭제
                        </button>
                      </div>
                      <span>
                        지인 {child.contacts_count} / 찜 {child.favorite_contacts_count} / 전화 {child.called_count} /
                        당원체크 {child.party_member_count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      <button type="button" className="secondary-btn" onClick={onClose}>
        메인으로 돌아가기
      </button>
    </section>
  );
}

function TreeOwnerContactsPanel({ ownerDetail, loading, onDownloadExcel, onBack }) {
  const [tableSearch, setTableSearch] = useState("");
  const filteredRecords = ownerDetail?.records?.filter((record) =>
    rowMatchesTableSearch(tableSearch, [
      record.person_name,
      record.phone,
      record.province,
      record.city_county,
      record.district,
      record.dong,
      record.address_detail,
      record.intimacy_checked ? "O" : "X",
      record.called ? "O" : "X",
      record.party_member ? "O" : "X",
    ])
  ) || [];
  return (
    <section>
      <h2>지인 목록</h2>
      {loading ? <p className="hint">불러오는 중...</p> : null}
      {!loading && ownerDetail ? (
        <>
          <p className="hint">
            {ownerDetail.group_name} / {ownerDetail.owner_name}
          </p>
          <div className="table-toolbar">
            <button type="button" className="download-link-btn" onClick={onDownloadExcel}>
              엑셀 다운로드
            </button>
          </div>
          <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="지인 목록 검색" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>도</th>
                  <th>시(군)</th>
                  <th>구</th>
                  <th>동</th>
                  <th>주소(상세)</th>
                  <th>찜</th>
                  <th>전화</th>
                  <th>당원체크</th>
                </tr>
              </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={record.intimacy_checked ? "favorite-row" : ""}
                    >
                      <td>{record.person_name || "-"}</td>
                      <td>{record.phone || "-"}</td>
                      <td>{record.province || "-"}</td>
                      <td>{record.city_county || "-"}</td>
                      <td>{record.district || "-"}</td>
                      <td>{record.dong || "-"}</td>
                      <td>{record.address_detail || "-"}</td>
                      <td>{record.intimacy_checked ? "O" : "X"}</td>
                      <td>{record.called ? "O" : "X"}</td>
                      <td>{record.party_member ? "O" : "X"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </>
      ) : null}
      <button type="button" className="secondary-btn" onClick={onBack}>
        트리보기로
      </button>
    </section>
  );
}

function ContactListPanel({
  title,
  contactsData,
  selectedCity,
  selectedDong,
  searchName,
  searchPhone,
  setSearchName,
  setSearchPhone,
  ownersByPhone,
  openOwnersPhone,
  loadingOwnersPhone,
  onSelectCity,
  onSelectDong,
  onSearch,
  onResetSearch,
  onToggleOwners,
  onOpenOwnerDetail,
  onPageMove,
  onDownloadExcel,
  onOpenElectionContacts,
  onBackToStats,
  onClose,
  jeonjuContactsMap,
  jeonjuContactsOpenKey,
  onToggleJeonjuContacts,
  onJeonjuPageMove,
  jeonjuOwnersByPhone,
  jeonjuOpenOwnersPhone,
  jeonjuLoadingOwnersPhone,
  onToggleJeonjuOwners,
  onDownloadJeonjuExcel,
}) {
  const [tableSearch, setTableSearch] = useState("");
  const totalPages = Math.max(1, Math.ceil((contactsData.total || 0) / (contactsData.page_size || 100)));
  const canGoPrev = contactsData.page > 1;
  const canGoNext = contactsData.page < totalPages;
  const filteredContactItems = contactsData.items.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.phone,
      row.name,
      row.city_county,
      row.dong,
      row.address_detail,
      row.owner_primary_name,
      row.created_at,
    ])
  );

  return (
    <section>
      <div className="stats-header">
        <h2>{title}</h2>
        <div className="table-toolbar">
          <button type="button" className="download-link-btn" onClick={onOpenElectionContacts}>
            선거구 연락처 목록
          </button>
          <button type="button" className="download-link-btn" onClick={onDownloadExcel}>
            엑셀 다운로드
          </button>
        </div>
      </div>

      <p className="hint">총 {contactsData.total}건 (페이지당 100건)</p>

      <form
        className="contact-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <input
          value={searchName}
          onChange={(event) => setSearchName(event.target.value)}
          placeholder="이름 검색"
        />
        <input
          value={searchPhone}
          onChange={(event) => setSearchPhone(event.target.value)}
          placeholder="연락처 검색"
        />
        <button type="submit">검색</button>
        <button type="button" className="secondary-btn-inline" onClick={onResetSearch}>
          초기화
        </button>
      </form>

      <div className="category-wrap">
        <p className="category-title">시(군) 분류</p>
        <div className="chip-row">
          <button
            type="button"
            className={`chip-btn ${selectedCity ? "" : "active"}`}
            onClick={() => onSelectCity("")}
          >
            전체
          </button>
          {JEONJU_CATEGORIES.map(({ key, label }) =>
            jeonjuContactsMap[key] != null ? (
              <button
                key={key}
                type="button"
                className={`chip-btn chip-btn-pink ${jeonjuContactsOpenKey === key ? "active" : ""}`}
                onClick={() => onToggleJeonjuContacts(key)}
              >
                {label} ({jeonjuContactsMap[key].total})
              </button>
            ) : null
          )}
          {contactsData.city_categories.map((category) => (
            <button
              key={category.name}
              type="button"
              className={`chip-btn ${selectedCity === category.name ? "active" : ""}`}
              onClick={() => onSelectCity(category.name)}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {jeonjuContactsOpenKey && jeonjuContactsMap[jeonjuContactsOpenKey] ? (() => {
        const d = jeonjuContactsMap[jeonjuContactsOpenKey];
        const label = JEONJU_CATEGORIES.find((c) => c.key === jeonjuContactsOpenKey)?.label || "";
        const totalPages = Math.ceil(d.total / d.page_size);
        return (
          <div className="jeonju-contacts-section">
            <p className="hint">
              [{label}] 데이터 중 내 연락처에 있고 전주시로 분류되지 않은 항목 (총 {d.total}건)
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>연락처</th>
                    <th>시(군)</th>
                    <th>동</th>
                    <th>주소 상세</th>
                    <th>찜한 사람 명단</th>
                  </tr>
                </thead>
                <tbody>
                  {d.items.map((item) => {
                    const ownerList = jeonjuOwnersByPhone[item.phone_normalized] || [];
                    const isOpen = jeonjuOpenOwnersPhone === item.phone_normalized;
                    const isLoadingOwners = jeonjuLoadingOwnersPhone === item.phone_normalized;
                    return [
                      <tr key={item.phone_normalized}>
                        <td>{item.name || "-"}</td>
                        <td>{item.phone || "-"}</td>
                        <td>{item.city_county || "-"}</td>
                        <td>{item.dong || "-"}</td>
                        <td>{item.address_detail || "-"}</td>
                        <td>
                          <button
                            type="button"
                            className="inline-link-btn"
                            onClick={() => onToggleJeonjuOwners(item.phone_normalized)}
                          >
                            찜한 사람 ({item.favorite_owner_count || 0})
                          </button>
                        </td>
                      </tr>,
                      isOpen ? (
                        <tr key={`${item.phone_normalized}-favorite-owners`}>
                          <td colSpan={6}>
                            {isLoadingOwners ? (
                              <p className="hint">찜한 사람 불러오는 중...</p>
                            ) : ownerList.length > 0 ? (
                              <div className="owner-chip-wrap">
                                {ownerList.map((owner) => (
                                  <button
                                    key={owner.id}
                                    type="button"
                                    className="chip-btn"
                                    onClick={() => onOpenOwnerDetail(owner.id)}
                                  >
                                    {owner.owner_name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="hint">찜한 사람 데이터가 없습니다.</p>
                            )}
                          </td>
                        </tr>
                      ) : null,
                    ];
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-toolbar">
              <button type="button" className="download-link-btn" onClick={() => onDownloadJeonjuExcel(jeonjuContactsOpenKey)}>
                엑셀 다운로드
              </button>
            </div>
            {d.total > d.page_size ? (
              <div className="pagination">
                <button type="button" disabled={d.page <= 1} onClick={() => onJeonjuPageMove(jeonjuContactsOpenKey, d.page - 1)}>이전</button>
                <span>{d.page} / {totalPages}</span>
                <button type="button" disabled={d.page >= totalPages} onClick={() => onJeonjuPageMove(jeonjuContactsOpenKey, d.page + 1)}>다음</button>
              </div>
            ) : null}
          </div>
        );
      })() : null}

      <div className="category-wrap">
        <p className="category-title">동 분류</p>
        <div className="chip-row">
          <button
            type="button"
            className={`chip-btn ${selectedDong ? "" : "active"}`}
            onClick={() => onSelectDong("")}
          >
            전체
          </button>
          {contactsData.dong_categories.map((category) => (
            <button
              key={category.name}
              type="button"
              className={`chip-btn ${selectedDong === category.name ? "active" : ""}`}
              onClick={() => onSelectDong(category.name)}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="지인 연락처 테이블 검색" />
        <table>
          <thead>
            <tr>
              <th>연락처</th>
              <th>이름</th>
              <th>시(군)</th>
              <th>동</th>
              <th>주소(상세)</th>
              <th>관리인원</th>
              <th>입력시각</th>
            </tr>
          </thead>
          <tbody>
            {filteredContactItems.length > 0 ? (
              filteredContactItems.map((row) => {
                const extraCount = Math.max(0, (row.owner_count || 0) - 1);
                const ownerList = ownersByPhone[row.phone_normalized] || [];
                const isOpen = openOwnersPhone === row.phone_normalized;
                const isLoadingOwners = loadingOwnersPhone === row.phone_normalized;

                return [
                  <tr key={row.phone_normalized}>
                    <td>{row.phone}</td>
                    <td>{row.name || "-"}</td>
                    <td>{row.city_county || "주소 없음"}</td>
                    <td>{row.dong || "주소 없음"}</td>
                    <td>{row.address_detail || "-"}</td>
                    <td>
                      <div className="owner-cell">
                        <span>{row.owner_primary_name || "-"}</span>
                        {extraCount > 0 ? (
                          <button
                            type="button"
                            className="inline-link-btn"
                            onClick={() => onToggleOwners(row.phone_normalized)}
                          >
                            +{extraCount}
                          </button>
                        ) : null}
                        {row.owner_count === 1 && row.owner_primary_name ? (
                          <button
                            type="button"
                            className="inline-link-btn"
                            onClick={() => onToggleOwners(row.phone_normalized)}
                          >
                            상세
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td>{new Date(row.created_at).toLocaleString()}</td>
                  </tr>,
                  isOpen ? (
                    <tr key={`${row.phone_normalized}-owners`}>
                      <td colSpan={7}>
                        {isLoadingOwners ? (
                          <p className="hint">관리인원 불러오는 중...</p>
                        ) : ownerList.length > 0 ? (
                          <div className="owner-chip-wrap">
                            {ownerList.map((owner) => (
                              <button
                                key={owner.id}
                                type="button"
                                className="chip-btn"
                                onClick={() => onOpenOwnerDetail(owner.id)}
                              >
                                {owner.owner_name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="hint">관리인원 데이터가 없습니다.</p>
                        )}
                      </td>
                    </tr>
                  ) : null,
                ];
              })
            ) : (
              <tr>
                <td colSpan={7}>표시할 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-wrap">
        <button type="button" onClick={() => onPageMove(contactsData.page - 1)} disabled={!canGoPrev}>
          이전
        </button>
        <span>
          {contactsData.page} / {totalPages}
        </span>
        <button type="button" onClick={() => onPageMove(contactsData.page + 1)} disabled={!canGoNext}>
          다음
        </button>
      </div>

      <button type="button" className="secondary-btn" onClick={onBackToStats}>
        통계보기로
      </button>
      <button type="button" className="secondary-btn" onClick={onClose}>
        메인으로 돌아가기
      </button>
    </section>
  );
}

function ElectionContactsPanel({
  data,
  selectedDistrict,
  unknownOnly,
  selectedCity,
  selectedDong,
  loading,
  ownersByPhone,
  openOwnersPhone,
  loadingOwnersPhone,
  onSelectDistrict,
  onSelectUnknown,
  onSelectCity,
  onSelectDong,
  onToggleOwners,
  onOpenOwnerDetail,
  onPageMove,
  districtToEdit,
  setDistrictToEdit,
  newDong,
  setNewDong,
  onAddDong,
  onDeleteDong,
  onDownloadExcel,
  onBackToContacts,
  onClose,
}) {
  const [tableSearch, setTableSearch] = useState("");
  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.page_size || 100)));
  const canGoPrev = data.page > 1;
  const canGoNext = data.page < totalPages;
  const filteredItems = data.items.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.phone,
      row.name,
      row.city_county,
      row.dong,
      row.address_detail,
      row.owner_primary_name,
      row.owner_count,
    ])
  );

  return (
    <section className="election-contacts-panel">
      <div className="stats-header">
        <h2>선거구 연락처 목록</h2>
        <div className="table-toolbar">
          <button type="button" className="download-link-btn" onClick={onDownloadExcel}>
            엑셀 다운로드
          </button>
        </div>
      </div>
      <p className="hint">총 {data.total}건 (페이지당 100건)</p>

      <div className="category-wrap">
        <p className="category-title">선거구 분류</p>
        <div className="chip-row">
          <button
            type="button"
            className={`chip-btn ${!selectedDistrict && !unknownOnly ? "active" : ""}`}
            onClick={() => onSelectDistrict("")}
          >
            전체
          </button>
          {data.districts.map((district) => (
            <button
              key={district.name}
              type="button"
              className={`chip-btn ${selectedDistrict === district.name && !unknownOnly ? "active" : ""}`}
              onClick={() => onSelectDistrict(district.name)}
            >
              {district.name} ({district.count})
            </button>
          ))}
          <button
            type="button"
            className={`chip-btn ${unknownOnly ? "active" : ""}`}
            onClick={onSelectUnknown}
          >
            미확인 데이터 ({data.unknown_count})
          </button>
        </div>
      </div>

      {unknownOnly ? (
        <>
          <div className="category-wrap">
            <p className="category-title">시(군) 분류</p>
            <div className="chip-row">
              <button
                type="button"
                className={`chip-btn ${!selectedCity ? "active" : ""}`}
                onClick={() => onSelectCity("")}
              >
                전체
              </button>
              {data.city_categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`chip-btn ${selectedCity === category.name ? "active" : ""}`}
                  onClick={() => onSelectCity(category.name)}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
          <div className="category-wrap">
            <p className="category-title">동 분류</p>
            <div className="chip-row">
              <button
                type="button"
                className={`chip-btn ${!selectedDong ? "active" : ""}`}
                onClick={() => onSelectDong("")}
              >
                전체
              </button>
              {data.dong_categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`chip-btn ${selectedDong === category.name ? "active" : ""}`}
                  onClick={() => onSelectDong(category.name)}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <form
        className="contact-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          onAddDong();
        }}
      >
        <select value={districtToEdit} onChange={(event) => setDistrictToEdit(event.target.value)}>
          {data.districts.map((district) => (
            <option key={district.name} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
        <input value={newDong} onChange={(event) => setNewDong(event.target.value)} placeholder="추가할 동 입력" />
        <button type="submit" disabled={loading}>
          동 추가
        </button>
      </form>

      {districtToEdit ? (
        <div className="category-wrap">
          <p className="category-title">{districtToEdit} 동 목록</p>
          <div className="chip-row">
            {(data.districts.find((d) => d.name === districtToEdit)?.dongs || []).map((dong) => (
              <span key={dong} className="dong-item-chip">
                {dong}
                <button type="button" className="dong-remove-btn" onClick={() => onDeleteDong(districtToEdit, dong)}>
                  삭제
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="선거구 연락처 테이블 검색" />
      <div className="table-wrap">
        <table className="election-contacts-table">
          <thead>
            <tr>
              <th>연락처</th>
              <th>이름</th>
              <th>시(군)</th>
              <th>동</th>
              <th>주소(상세)</th>
              <th>관리인원</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((row) => {
                const ownerList = ownersByPhone[row.phone_normalized] || [];
                const isOpen = openOwnersPhone === row.phone_normalized;
                const isLoadingOwners = loadingOwnersPhone === row.phone_normalized;
                return [
                  <tr key={row.phone_normalized}>
                    <td>{row.phone}</td>
                    <td>{row.name || "-"}</td>
                    <td>{row.city_county || "주소 없음"}</td>
                    <td>{row.dong || "주소 없음"}</td>
                    <td>{row.address_detail || "-"}</td>
                    <td>
                      <div className="owner-cell">
                        <span>{row.owner_primary_name || "-"}</span>
                        {row.owner_count > 0 ? (
                          <button
                            type="button"
                            className="inline-link-btn"
                            onClick={() => onToggleOwners(row.phone_normalized)}
                          >
                            ({row.owner_count})
                          </button>
                        ) : (
                          <span>(0)</span>
                        )}
                      </div>
                    </td>
                  </tr>,
                  isOpen ? (
                    <tr key={`${row.phone_normalized}-owners`}>
                      <td colSpan={6}>
                        {isLoadingOwners ? (
                          <p className="hint">관리인원 불러오는 중...</p>
                        ) : ownerList.length > 0 ? (
                          <div className="owner-chip-wrap">
                            {ownerList.map((owner) => (
                              <button
                                key={owner.id}
                                type="button"
                                className="chip-btn"
                                onClick={() => onOpenOwnerDetail(owner.id)}
                              >
                                {owner.owner_name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="hint">관리인원 데이터가 없습니다.</p>
                        )}
                      </td>
                    </tr>
                  ) : null,
                ];
              })
            ) : (
              <tr>
                <td colSpan={6}>표시할 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-wrap">
        <button type="button" onClick={() => onPageMove(data.page - 1)} disabled={!canGoPrev}>
          이전
        </button>
        <span>
          {data.page} / {totalPages}
        </span>
        <button type="button" onClick={() => onPageMove(data.page + 1)} disabled={!canGoNext}>
          다음
        </button>
      </div>

      <div className="panel-actions">
        <button type="button" className="secondary-btn" onClick={onBackToContacts}>
          지인 연락처 목록으로
        </button>
        <button type="button" className="secondary-btn" onClick={onClose}>
          메인으로 돌아가기
        </button>
      </div>
    </section>
  );
}

function OwnerDetailPanel({ ownerDetail, onBack }) {
  const [tableSearch, setTableSearch] = useState("");
  const filteredRecords = ownerDetail.records.filter((record) =>
    rowMatchesTableSearch(tableSearch, [
      record.person_name,
      record.phone,
      record.intimacy_checked ? "O" : "X",
      record.called ? "O" : "X",
      record.party_member ? "O" : "X",
      record.created_at,
    ])
  );
  return (
    <section>
      <h2>관리인원 개인 데이터</h2>
      <p className="hint">
        {ownerDetail.owner_name} / {ownerDetail.group_name} / 업로드:{" "}
        {ownerDetail.uploaded_at ? new Date(ownerDetail.uploaded_at).toLocaleString() : "-"}
      </p>

      <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="개인 데이터 테이블 검색" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>연락처</th>
              <th>친밀도</th>
              <th>전화여부</th>
              <th>당원체크</th>
              <th>입력시각</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.person_name || "-"}</td>
                  <td>{record.phone || "-"}</td>
                  <td>{record.intimacy_checked ? "O" : "X"}</td>
                  <td>{record.called ? "O" : "X"}</td>
                  <td>{record.party_member ? "O" : "X"}</td>
                  <td>{new Date(record.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button type="button" className="secondary-btn" onClick={onBack}>
        연락처 목록으로
      </button>
    </section>
  );
}

function JeonjuPanel({
  loading,
  jeonjuFiles,
  jeonjuMessage,
  jeonjuUploadOpen,
  jeonjuRecordSummary,
  jeonjuRecordData,
  jeonjuRecordOpenKey,
  jeonjuRecordSearchName,
  jeonjuRecordSearchPhone,
  setJeonjuRecordSearchName,
  setJeonjuRecordSearchPhone,
  onToggleUpload,
  onSetJeonjuFile,
  onUploadJeonju,
  onOpenJeonjuRecords,
  onSearchJeonjuRecords,
  onResetJeonjuRecords,
  onDownloadJeonjuRecordsExcel,
  onPageMoveJeonjuRecords,
  onClose,
}) {
  const totalPages = Math.max(1, Math.ceil((jeonjuRecordData.total || 0) / (jeonjuRecordData.page_size || 100)));

  return (
    <section>
      <div className="stats-header">
        <h2>전주시 데이터</h2>
        <button type="button" className="download-link-btn" onClick={onToggleUpload}>
          {jeonjuUploadOpen ? "데이터 추가 숨기기" : "데이터 추가하기"}
        </button>
      </div>

      <p className="hint">카테고리별 업로드 건수를 확인하고, 버튼을 눌러 저장된 원본 리스트를 볼 수 있습니다.</p>

      {jeonjuUploadOpen ? (
        <section className="jeonju-upload-section">
          <p className="hint">A열 이름, B열 연락처 형식의 .xlsx 파일을 업로드하세요. 기존 데이터는 교체하지 않고, 같은 카테고리 내 중복 연락처만 제외하고 추가 저장합니다.</p>
          {JEONJU_CATEGORIES.map(({ key, label }) => (
            <form key={key} className="upload-form" onSubmit={(e) => onUploadJeonju(e, key)}>
              <label className="file-input-wrap">
                {label} 데이터 추가 (.xlsx)
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => onSetJeonjuFile(key, e.target.files?.[0] || null)}
                />
              </label>
              <p className="hint">선택 파일: {jeonjuFiles[key]?.name || "없음"}</p>
              <button type="submit" disabled={loading}>
                {loading ? "업로드 중..." : `${label} 업로드`}
              </button>
            </form>
          ))}
        </section>
      ) : null}

      {jeonjuMessage ? <p className="hint">{jeonjuMessage}</p> : null}

      <div className="stats-cards">
        {JEONJU_CATEGORIES.map(({ key, label }) => {
          const summary = jeonjuRecordSummary[key] || { total: 0 };
          return (
            <button
              key={key}
              type="button"
              className={`stats-card stats-card-button ${jeonjuRecordOpenKey === key ? "stats-card-selected" : ""}`}
              onClick={() => onOpenJeonjuRecords(key)}
              aria-expanded={jeonjuRecordOpenKey === key}
              aria-controls="jeonju-records-table"
            >
              <strong>{label}</strong>
              <span>{summary.total || 0}</span>
            </button>
          );
        })}
      </div>

      <p className="hint">
        기준시각: {jeonjuRecordSummary.all?.refreshed_at ? new Date(jeonjuRecordSummary.all.refreshed_at).toLocaleString() : "-"}
      </p>

      {jeonjuRecordOpenKey ? (
        <section className="jeonju-records-section" id="jeonju-records-table">
          <div className="stats-header">
            <h3>{JEONJU_CATEGORIES.find((category) => category.key === jeonjuRecordOpenKey)?.label || ""} 데이터 리스트</h3>
            <button type="button" className="download-link-btn" onClick={onDownloadJeonjuRecordsExcel}>
              엑셀 다운로드
            </button>
          </div>
          <form
            className="contact-search-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchJeonjuRecords();
            }}
          >
            <input
              value={jeonjuRecordSearchName}
              onChange={(event) => setJeonjuRecordSearchName(event.target.value)}
              placeholder="이름 검색"
            />
            <input
              value={jeonjuRecordSearchPhone}
              onChange={(event) => setJeonjuRecordSearchPhone(event.target.value)}
              placeholder="연락처 검색"
            />
            <button type="submit">검색</button>
            <button type="button" className="secondary-btn-inline" onClick={onResetJeonjuRecords}>
              초기화
            </button>
          </form>
          <p className="hint">
            총 {jeonjuRecordData.total || 0}건 / {jeonjuRecordData.page || 1}페이지 / 기준시각{" "}
            {jeonjuRecordData.refreshed_at ? new Date(jeonjuRecordData.refreshed_at).toLocaleString() : "-"}
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>입력시각</th>
                </tr>
              </thead>
              <tbody>
                {jeonjuRecordData.items.length > 0 ? (
                  jeonjuRecordData.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.jeonju_name || "-"}</td>
                      <td>{item.phone || "-"}</td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>표시할 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-wrap">
            <button
              type="button"
              onClick={() => onPageMoveJeonjuRecords(jeonjuRecordData.page - 1)}
              disabled={jeonjuRecordData.page <= 1}
            >
              이전
            </button>
            <span>
              {jeonjuRecordData.page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageMoveJeonjuRecords(jeonjuRecordData.page + 1)}
              disabled={jeonjuRecordData.page >= totalPages}
            >
              다음
            </button>
          </div>
        </section>
      ) : null}

      <button type="button" className="secondary-btn" onClick={onClose}>
        돌아가기
      </button>
    </section>
  );
}

function ComparePanel({
  loading,
  compareFiles,
  setCompareFiles,
  setJeonjuConvertFile,
  compareMessage,
  invalidCount,
  onDownloadTemplate,
  onDownloadErrors,
  compareData,
  onPageMove,
  onConvertJeonju,
  onUploadCompare,
  electionDistrictMap,
  onFetchElectionDistricts,
  compareFilter,
  onSelectCompareFilter,
  onDownloadSelectedCompareFilter,
  onClose,
}) {
  const totalCompareCount = compareData.total || 0;
  const compareDongCount = compareData.dong_count || 0;
  const latestUpdatedAt = compareData.latest_updated_at || null;
  const totalPages = Math.max(1, Math.ceil(totalCompareCount / (compareData.page_size || 100)));
  const [isCompareListOpen, setIsCompareListOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const filteredCompareItems = compareData.items.filter((row) =>
    rowMatchesTableSearch(tableSearch, [
      row.full_name,
      row.birth_date,
      row.phone,
      row.province,
      row.city_county,
      row.district,
      row.dong,
      row.address_detail,
      row.updated_at,
    ])
  );

  return (
    <section>
      <h2>비교군 추가하기</h2>

      <div className="compare-summary">
        <button
          type="button"
          className="stats-card stats-card-button"
          onClick={() => { setIsCompareListOpen((prev) => !prev); if (!isCompareListOpen) onFetchElectionDistricts(); }}
          disabled={totalCompareCount === 0}
          aria-expanded={isCompareListOpen}
          aria-controls="compare-records-table"
          title={totalCompareCount > 0 ? "비교군 리스트 보기/숨기기" : "등록된 비교군 데이터가 없습니다."}
        >
          <strong>현재 비교군 건수</strong>
          <span>{totalCompareCount.toLocaleString()}</span>
        </button>
        <div className="stats-card">
          <strong>동 데이터 있음</strong>
          <span>{compareDongCount.toLocaleString()}</span>
        </div>
        <div className="stats-card">
          <strong>최근 갱신 시각</strong>
          <span className="summary-datetime">
            {latestUpdatedAt ? new Date(latestUpdatedAt).toLocaleString() : "-"}
          </span>
        </div>
      </div>

      <button type="button" className="download-link-btn" onClick={onDownloadTemplate}>
        샘플 엑셀 다운로드
      </button>

      <form onSubmit={onConvertJeonju} className="upload-form">
        <label className="file-input-wrap">
          전주시 원본 엑셀 (모든 시트 자동 변환)
          <input
            type="file"
            accept=".xlsx"
            onChange={(event) => setJeonjuConvertFile(event.target.files?.[0] || null)}
          />
        </label>
        <button type="submit" className="download-link-btn" disabled={loading}>
          전주시 데이터 업로드 파일로 변환
        </button>
      </form>

      <form onSubmit={onUploadCompare} className="upload-form">
        <label className="file-input-wrap">
          비교군 엑셀 업로드 (.xlsx, 복수 선택 가능)
          <input
            type="file"
            multiple
            accept=".xlsx"
            onChange={(event) => setCompareFiles(Array.from(event.target.files || []))}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "업로드 중..." : "비교군 업로드"}
        </button>
      </form>

      {compareMessage ? <p className="hint">{compareMessage}</p> : null}
      {invalidCount > 0 ? (
        <button type="button" className="secondary-btn" onClick={onDownloadErrors}>
          잘못된 데이터 목록 다운로드 ({invalidCount}건)
        </button>
      ) : null}

      {totalCompareCount > 0 && isCompareListOpen ? (
        <>
          <div className="district-download-group">
            <p className="hint">카테고리 선택</p>
            <div className="district-download-buttons">
              <button
                type="button"
                className={`chip-btn ${compareFilter.type === "all" ? "active" : ""}`}
                onClick={() => onSelectCompareFilter({ type: "all", value: "", label: "전체" })}
              >
                전체
              </button>
              {Object.keys(electionDistrictMap).map((districtName) => (
                <button
                  key={districtName}
                  type="button"
                  className={`chip-btn ${compareFilter.type === "district" && compareFilter.value === districtName ? "active" : ""}`}
                  onClick={() => onSelectCompareFilter({ type: "district", value: districtName, label: districtName })}
                >
                  {districtName}
                </button>
              ))}
            </div>
            <p className="hint">동 카테고리</p>
            <div className="district-download-buttons">
              <button
                type="button"
                className={`chip-btn ${compareFilter.type === "keyword" && compareFilter.value === "효자동" ? "active" : ""}`}
                onClick={() => onSelectCompareFilter({ type: "keyword", value: "효자동", label: "효자동 전체" })}
              >
                효자동 전체
              </button>
              <button
                type="button"
                className={`chip-btn ${compareFilter.type === "keyword" && compareFilter.value === "송천동" ? "active" : ""}`}
                onClick={() => onSelectCompareFilter({ type: "keyword", value: "송천동", label: "송천동 전체" })}
              >
                송천동 전체
              </button>
            </div>
            <div className="table-toolbar">
              <button
                type="button"
                className="download-link-btn"
                onClick={onDownloadSelectedCompareFilter}
                disabled={compareFilter.type === "all"}
              >
                선택 카테고리 엑셀 다운로드
              </button>
            </div>
            {compareFilter.type !== "all" ? <p className="hint">선택된 카테고리: {compareFilter.label}</p> : null}
          </div>
          <p className="hint">
            총 {totalCompareCount.toLocaleString()}건 / {compareData.page}페이지 / 마지막 정합{" "}
            {compareData.refreshed_at ? new Date(compareData.refreshed_at).toLocaleString() : "-"}
          </p>
          <TableSearchBar value={tableSearch} onChange={setTableSearch} placeholder="비교군 테이블 검색" />
          <div className="table-wrap" id="compare-records-table">
            <table>
              <thead>
                <tr>
                  <th>성명</th>
                  <th>생년월일</th>
                  <th>연락처</th>
                  <th>도</th>
                  <th>시(군)</th>
                  <th>구</th>
                  <th>동</th>
                  <th>주소(상세)</th>
                  <th>입력시각</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompareItems.length > 0 ? (
                  filteredCompareItems.map((row) => (
                    <tr key={row.id}>
                      <td>{row.full_name || "-"}</td>
                      <td>{row.birth_date || "-"}</td>
                      <td>{row.phone}</td>
                      <td>{row.province || "-"}</td>
                      <td>{row.city_county || "-"}</td>
                      <td>{row.district || "-"}</td>
                      <td>{row.dong || "-"}</td>
                      <td>{row.address_detail || "-"}</td>
                      <td>{new Date(row.updated_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>표시할 비교군 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-wrap">
            <button type="button" onClick={() => onPageMove(compareData.page - 1)} disabled={compareData.page <= 1}>
              이전
            </button>
            <span>
              {compareData.page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageMove(compareData.page + 1)}
              disabled={compareData.page >= totalPages}
            >
              다음
            </button>
          </div>
        </>
      ) : null}

      {totalCompareCount > 0 && !isCompareListOpen ? (
        <p className="hint">현재 비교군 건수를 눌러 리스트를 확인하세요.</p>
      ) : null}

      {totalCompareCount === 0 ? <p className="hint">등록된 비교군 데이터가 없습니다.</p> : null}

      <button type="button" className="secondary-btn" onClick={onClose}>
        메인으로 돌아가기
      </button>
    </section>
  );
}

export default function App() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY) || "");
  const [loginError, setLoginError] = useState("");

  const [activeComponent, setActiveComponent] = useState(() => {
    if (typeof window === "undefined") return "main";
    return HASH_TO_VIEW[window.location.hash] || "main";
  });
  const [statsMode, setStatsMode] = useState("acquaintance");
  const [loading, setLoading] = useState(false);

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const [newGroupName, setNewGroupName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [jeonjuConvertFile, setJeonjuConvertFile] = useState(null);
  const [formMessage, setFormMessage] = useState("");
  const [uploadJob, setUploadJob] = useState(null);
  const uploadPollTimerRef = useRef(null);
  const [supporterFile, setSupporterFile] = useState(null);
  const [supporterView, setSupporterView] = useState("upload");
  const [supporterMessage, setSupporterMessage] = useState("");
  const [supporterUploadJob, setSupporterUploadJob] = useState(null);
  const supporterUploadPollTimerRef = useRef(null);
  const [supporterStats, setSupporterStats] = useState({
    total_supporters: 0,
    today_added_supporters: 0,
    compare_matched_with_address: 0,
    refreshed_at: "",
  });
  const [supporterListScope, setSupporterListScope] = useState("total");
  const [supporterFilter, setSupporterFilter] = useState({ type: "all", value: "", label: "전체" });
  const [supporterListData, setSupporterListData] = useState({
    scope: "total",
    total: 0,
    page: 1,
    page_size: 100,
    refreshed_at: "",
    items: [],
  });

  const [jeonjuFiles, setJeonjuFiles] = useState({ all: null, gap: null, eul: null, byeong: null });
  const [jeonjuMessage, setJeonjuMessage] = useState("");
  const [jeonjuUploadOpen, setJeonjuUploadOpen] = useState(false);
  const [jeonjuRecordSummary, setJeonjuRecordSummary] = useState({
    all: { category: "all", total: 0, refreshed_at: "" },
    gap: { category: "gap", total: 0, refreshed_at: "" },
    eul: { category: "eul", total: 0, refreshed_at: "" },
    byeong: { category: "byeong", total: 0, refreshed_at: "" },
  });
  const [jeonjuRecordOpenKey, setJeonjuRecordOpenKey] = useState("all");
  const [jeonjuRecordSearchName, setJeonjuRecordSearchName] = useState("");
  const [jeonjuRecordSearchPhone, setJeonjuRecordSearchPhone] = useState("");
  const [jeonjuRecordData, setJeonjuRecordData] = useState({
    category: "all",
    total: 0,
    page: 1,
    page_size: 100,
    refreshed_at: "",
    items: [],
  });

  const [compareFiles, setCompareFiles] = useState([]);
  const [compareData, setCompareData] = useState({
    total: 0,
    dong_count: 0,
    page: 1,
    page_size: 100,
    latest_updated_at: null,
    refreshed_at: null,
    items: [],
  });
  const [compareFilter, setCompareFilter] = useState({ type: "all", value: "", label: "전체" });
  const [compareMessage, setCompareMessage] = useState("");
  const [compareInvalidCount, setCompareInvalidCount] = useState(0);
  const [compareErrorBatchId, setCompareErrorBatchId] = useState("");
  const [electionDistrictMap, setElectionDistrictMap] = useState({});

  const [statsSummary, setStatsSummary] = useState({
    total_managers: 0,
    today_representatives: 0,
    today_added_managers: 0,
    favorite_contacts: 0,
    total_contacts: 0,
    unified_total_people: 0,
    unified_matched_with_address: 0,
    refreshed_at: "",
  });
  const [combinedContactsScope, setCombinedContactsScope] = useState("total");
  const [overallListScope, setOverallListScope] = useState("");
  const [combinedContactsFilter, setCombinedContactsFilter] = useState({ type: "all", value: "", label: "전체" });
  const [combinedContactsCategoryCounts, setCombinedContactsCategoryCounts] = useState({});
  const [combinedContactsData, setCombinedContactsData] = useState({
    scope: "total",
    total: 0,
    page: 1,
    page_size: 100,
    refreshed_at: "",
    items: [],
  });
  const [dailyStatsRows, setDailyStatsRows] = useState([]);
  const [isDailyStatsOpen, setIsDailyStatsOpen] = useState(false);
  const [todayManagerRows, setTodayManagerRows] = useState([]);
  const [dailyDetail, setDailyDetail] = useState({ stat_date: "", metric: "", count: 0, rows: [] });
  const [dailyDetailLoading, setDailyDetailLoading] = useState(false);
  const [dailyDetailError, setDailyDetailError] = useState("");
  const [treeRows, setTreeRows] = useState([]);
  const [selectedTreeOwnerId, setSelectedTreeOwnerId] = useState(null);
  const [treeOwnerDetail, setTreeOwnerDetail] = useState(null);
  const [treeOwnerLoading, setTreeOwnerLoading] = useState(false);
  const [contactsData, setContactsData] = useState({
    total: 0,
    page: 1,
    page_size: 100,
    city_categories: [],
    dong_categories: [],
    items: [],
  });
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDong, setSelectedDong] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [jeonjuContactsMap, setJeonjuContactsMap] = useState({ all: null, gap: null, eul: null, byeong: null });
  const [jeonjuContactsOpenKey, setJeonjuContactsOpenKey] = useState(null);
  const [favoriteOnlyContacts, setFavoriteOnlyContacts] = useState(false);
  const [electionContactsData, setElectionContactsData] = useState({
    total: 0,
    page: 1,
    page_size: 100,
    districts: [],
    unknown_count: 0,
    city_categories: [],
    dong_categories: [],
    items: [],
  });
  const [selectedElectionDistrict, setSelectedElectionDistrict] = useState("");
  const [electionUnknownOnly, setElectionUnknownOnly] = useState(false);
  const [electionSelectedCity, setElectionSelectedCity] = useState("");
  const [electionSelectedDong, setElectionSelectedDong] = useState("");
  const [districtToEdit, setDistrictToEdit] = useState("가선거구");
  const [newElectionDong, setNewElectionDong] = useState("");
  const [ownersByPhone, setOwnersByPhone] = useState({});
  const [openOwnersPhone, setOpenOwnersPhone] = useState("");
  const [loadingOwnersPhone, setLoadingOwnersPhone] = useState("");
  const [jeonjuOwnersByPhone, setJeonjuOwnersByPhone] = useState({});
  const [jeonjuOpenOwnersPhone, setJeonjuOpenOwnersPhone] = useState("");
  const [jeonjuLoadingOwnersPhone, setJeonjuLoadingOwnersPhone] = useState("");
  const [ownerDetail, setOwnerDetail] = useState(null);

  const navigateTo = (view, replace = false) => {
    const nextView = VIEW_TO_HASH[view] ? view : "main";
    const nextHash = VIEW_TO_HASH[nextView];

    setActiveComponent(nextView);
    if (typeof window === "undefined") return;
    if (window.location.hash === nextHash) return;

    if (replace) {
      window.history.replaceState(null, "", nextHash);
      return;
    }
    window.location.hash = nextHash;
  };

  const statsRootView = statsMode === "overall" ? "stats" : "acquaintanceStats";

  const doLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setGroups([]);
    setSelectedGroupId("");
    navigateTo("main", true);
  };

  const authFetch = async (path, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      doLogout();
      throw new Error("unauthorized");
    }
    return response;
  };

  const clearUploadPoll = () => {
    if (uploadPollTimerRef.current) {
      clearTimeout(uploadPollTimerRef.current);
      uploadPollTimerRef.current = null;
    }
  };

  const clearSupporterUploadPoll = () => {
    if (supporterUploadPollTimerRef.current) {
      clearTimeout(supporterUploadPollTimerRef.current);
      supporterUploadPollTimerRef.current = null;
    }
  };

  const pollUploadJob = async (jobId) => {
    try {
      const response = await authFetch(`/data/upload/jobs/${jobId}`);
      if (!response.ok) {
        setFormMessage("업로드 진행상태 조회에 실패했습니다.");
        return;
      }
      const job = await response.json();
      setUploadJob(job);

      if (job.status === "completed") {
        setUploadFiles([]);
        setFormMessage(
          `업로드 완료: 파일 ${job.total_files || 0}개, 데이터 ${job.inserted_records || 0}건 저장`
        );
        return;
      }
      if (job.status === "failed") {
        setFormMessage(`업로드 실패: ${job.error || "알 수 없는 오류"}`);
        return;
      }

      clearUploadPoll();
      uploadPollTimerRef.current = setTimeout(() => {
        pollUploadJob(jobId);
      }, 1500);
    } catch {
      setFormMessage("업로드 진행상태 조회 중 문제가 발생했습니다.");
    }
  };

  const pollSupporterUploadJob = async (jobId) => {
    try {
      const response = await authFetch(`/supporters/upload/jobs/${jobId}`);
      if (!response.ok) {
        setSupporterMessage("서포터 업로드 진행상태 조회에 실패했습니다.");
        return;
      }
      const job = await response.json();
      setSupporterUploadJob(job);

      if (job.status === "completed") {
        setSupporterMessage(
          `업로드 완료: 읽은 행 ${job.rows_read || 0}, 신규 ${job.inserted || 0}, 중복 제외 ${job.skipped_duplicate || 0}, 오류 ${job.invalid_count || 0}`
        );
        await fetchSupporterStatsSummary();
        return;
      }
      if (job.status === "failed") {
        setSupporterMessage(`업로드 실패: ${job.error || "알 수 없는 오류"}`);
        return;
      }

      clearSupporterUploadPoll();
      supporterUploadPollTimerRef.current = setTimeout(() => {
        pollSupporterUploadJob(jobId);
      }, 1500);
    } catch {
      setSupporterMessage("서포터 업로드 진행상태 조회 중 문제가 발생했습니다.");
    }
  };

  const fetchGroups = async () => {
    const response = await authFetch("/groups");
    const data = await response.json();
    setGroups(data);

    if (!selectedGroupId && data.length > 0) {
      setSelectedGroupId(String(data[0].id));
    }

    if (selectedGroupId && !data.some((group) => String(group.id) === String(selectedGroupId))) {
      setSelectedGroupId(data[0] ? String(data[0].id) : "");
    }
  };

  const fetchCompareRecords = async (page = 1, filter = compareFilter) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (filter?.type === "district" && filter.value) params.set("district_name", filter.value);
    if (filter?.type === "keyword" && filter.value) params.set("address_contains", filter.value);
    const response = await authFetch(`/compare-records?${params.toString()}`);
    const data = await response.json();
    setCompareData(data);
  };

  const fetchElectionDistricts = async () => {
    const response = await authFetch("/election-districts");
    if (response.ok) {
      const data = await response.json();
      setElectionDistrictMap(data);
    }
  };

  const fetchStatsSummary = async () => {
    const response = await authFetch("/stats/summary");
    const data = await response.json();
    setStatsSummary(data);
  };

  const fetchCombinedContacts = async (page = 1, scope = combinedContactsScope, filter = combinedContactsFilter) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("scope", scope);
    if (filter?.type === "district" && filter.value) params.set("district_name", filter.value);
    if (filter?.type === "keyword" && filter.value) params.set("address_contains", filter.value);
    const response = await authFetch(`/stats/combined-contacts?${params.toString()}`);
    const data = await response.json();
    setCombinedContactsData(data);
    setCombinedContactsScope(scope);
  };

  const fetchCombinedContactCategoryCounts = async () => {
    const response = await authFetch("/stats/combined-contacts/category-counts");
    const data = await response.json();
    const next = {};
    data.forEach((item) => {
      next[`${item.category_type}:${item.key}`] = item.count;
    });
    setCombinedContactsCategoryCounts(next);
  };

  const fetchSupporterStatsSummary = async () => {
    const response = await authFetch("/supporters/stats/summary");
    const data = await response.json();
    setSupporterStats(data);
  };

  const fetchSupporterList = async (page = 1, scope = supporterListScope, filter = supporterFilter) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("scope", scope);
    if (filter?.type === "district" && filter.value) params.set("district_name", filter.value);
    if (filter?.type === "keyword" && filter.value) params.set("address_contains", filter.value);
    const response = await authFetch(`/supporters/list?${params.toString()}`);
    const data = await response.json();
    setSupporterListData(data);
    setSupporterListScope(scope);
  };

  const fetchDailyStats = async () => {
    const response = await authFetch("/stats/daily");
    const data = await response.json();
    setDailyStatsRows(data);
  };

  const fetchTodayManagers = async () => {
    const response = await authFetch("/stats/today-managers");
    const data = await response.json();
    setTodayManagerRows(data);
  };

  const fetchDailyDetail = async (statDate, metric) => {
    setDailyDetailLoading(true);
    setDailyDetailError("");
    try {
      const params = new URLSearchParams();
      params.set("stat_date", statDate);
      params.set("metric", metric);
      const response = await authFetch(`/stats/daily/details?${params.toString()}`);
      if (!response.ok) {
        let message = "상세 데이터를 불러오지 못했습니다.";
        try {
          const err = await response.json();
          if (err?.detail) message = String(err.detail);
        } catch {
          // ignore
        }
        setDailyDetailError(message);
        setDailyDetail({ stat_date: statDate, metric, count: 0, rows: [] });
        return;
      }
      const data = await response.json();
      setDailyDetail(data);
    } catch {
      setDailyDetailError("상세 데이터를 불러오는 중 문제가 발생했습니다.");
      setDailyDetail({ stat_date: statDate, metric, count: 0, rows: [] });
    } finally {
      setDailyDetailLoading(false);
    }
  };

  const fetchTreeStats = async () => {
    const response = await authFetch("/stats/tree");
    const data = await response.json();
    setTreeRows(data);
  };

  const fetchContacts = async ({
    page = 1,
    city = "",
    dong = "",
    name = "",
    phone = "",
    favoriteOnly = false,
  } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (city) params.set("city", city);
    if (dong) params.set("dong", dong);
    if (name) params.set("name", name);
    if (phone) params.set("phone", phone);
    if (favoriteOnly) params.set("favorite_only", "true");
    const response = await authFetch(`/contacts?${params.toString()}`);
    const data = await response.json();
    setContactsData(data);
    setOpenOwnersPhone("");
  };

  const fetchJeonjuContacts = async (category, page = 1, favoriteOnly = false) => {
    const params = new URLSearchParams();
    params.set("category", category);
    params.set("page", String(page));
    if (favoriteOnly) params.set("favorite_only", "true");
    const response = await authFetch(`/jeonju/contacts?${params.toString()}`);
    const data = await response.json();
    setJeonjuContactsMap((prev) => ({ ...prev, [category]: data }));
  };

  const fetchAllJeonjuContactCounts = async (favoriteOnly = false) => {
    for (const { key } of JEONJU_CATEGORIES) {
      const params = new URLSearchParams();
      params.set("category", key);
      params.set("page", "1");
      if (favoriteOnly) params.set("favorite_only", "true");
      const response = await authFetch(`/jeonju/contacts?${params.toString()}`);
      const data = await response.json();
      setJeonjuContactsMap((prev) => ({ ...prev, [key]: data }));
    }
  };

  const fetchJeonjuRecordSummary = async () => {
    const response = await authFetch("/jeonju/records/summary");
    const data = await response.json();
    const next = {
      all: { category: "all", total: 0, refreshed_at: "" },
      gap: { category: "gap", total: 0, refreshed_at: "" },
      eul: { category: "eul", total: 0, refreshed_at: "" },
      byeong: { category: "byeong", total: 0, refreshed_at: "" },
    };
    data.forEach((item) => {
      next[item.category] = item;
    });
    setJeonjuRecordSummary(next);
  };

  const fetchJeonjuRecordList = async (
    category = "all",
    page = 1,
    filters = { name: jeonjuRecordSearchName, phone: jeonjuRecordSearchPhone }
  ) => {
    const params = new URLSearchParams();
    params.set("category", category);
    params.set("page", String(page));
    if (filters.name?.trim()) params.set("name", filters.name.trim());
    if (filters.phone?.trim()) params.set("phone", filters.phone.trim());
    const response = await authFetch(`/jeonju/records?${params.toString()}`);
    const data = await response.json();
    setJeonjuRecordOpenKey(category);
    setJeonjuRecordData(data);
  };

  const fetchElectionContacts = async ({ page = 1, district = "", unknownOnly = false, city = "", dong = "" } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (district) params.set("district", district);
    if (unknownOnly) params.set("unknown_only", "true");
    if (city) params.set("city", city);
    if (dong) params.set("dong", dong);
    const response = await authFetch(`/contacts/election?${params.toString()}`);
    const data = await response.json();
    setElectionContactsData(data);
    if (data.districts?.length > 0 && !districtToEdit) {
      setDistrictToEdit(data.districts[0].name);
    }
  };

  const fetchContactOwners = async (phoneNormalized, favoriteOnly = false) => {
    if (!phoneNormalized) return [];
    const params = new URLSearchParams();
    if (favoriteOnly) params.set("favorite_only", "true");
    const query = params.toString();
    const response = await authFetch(`/contacts/${phoneNormalized}/owners${query ? `?${query}` : ""}`);
    const data = await response.json();
    return data;
  };

  const fetchOwnerDetail = async (ownerId) => {
    const response = await authFetch(`/owners/${ownerId}`);
    const data = await response.json();
    setOwnerDetail(data);
    return data;
  };

  useEffect(() => {
    if (!token) return;
    fetchGroups();
  }, [token]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromHash = () => {
      const view = HASH_TO_VIEW[window.location.hash] || "main";
      setActiveComponent(view);
    };

    if (!HASH_TO_VIEW[window.location.hash]) {
      window.history.replaceState(null, "", VIEW_TO_HASH.main);
    }
    syncFromHash();

    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!token || activeComponent !== "compare") return;
    fetchCompareRecords(1, compareFilter);
  }, [token, activeComponent]);

  useEffect(() => {
    return () => clearUploadPoll();
  }, []);

  useEffect(() => {
    return () => clearSupporterUploadPoll();
  }, []);

  useEffect(() => {
    if (!token || (activeComponent !== "stats" && activeComponent !== "acquaintanceStats")) return;
    fetchStatsSummary();
    setIsDailyStatsOpen(false);
    if (activeComponent === "stats") {
      setOverallListScope("");
      setCombinedContactsFilter({ type: "all", value: "", label: "전체" });
    }
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "combinedContacts") return;
    if (combinedContactsScope === "matched") {
      fetchElectionDistricts();
      fetchCombinedContactCategoryCounts();
    }
    fetchCombinedContacts(1, combinedContactsScope, combinedContactsFilter);
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "supporter") return;
    fetchSupporterStatsSummary();
    fetchElectionDistricts();
    setSupporterView("upload");
    setSupporterListScope("total");
    setSupporterFilter({ type: "all", value: "", label: "전체" });
    setSupporterListData({
      scope: "total",
      total: 0,
      page: 1,
      page_size: 100,
      refreshed_at: "",
      items: [],
    });
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "todayManagers") return;
    fetchTodayManagers();
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "tree") return;
    fetchTreeStats();
    setSelectedTreeOwnerId(null);
    setTreeOwnerDetail(null);
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "contacts") return;
    fetchContacts({
      page: 1,
      city: selectedCity,
      dong: selectedDong,
      name: searchName,
      phone: searchPhone,
      favoriteOnly: favoriteOnlyContacts,
    });
    fetchAllJeonjuContactCounts(favoriteOnlyContacts);
    setJeonjuContactsOpenKey(null);
    setJeonjuOpenOwnersPhone("");
    setJeonjuOwnersByPhone({});
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "electionContacts") return;
    fetchElectionContacts({
      page: 1,
      district: selectedElectionDistrict,
      unknownOnly: electionUnknownOnly,
      city: electionSelectedCity,
      dong: electionSelectedDong,
    });
  }, [token, activeComponent]);

  useEffect(() => {
    if (!token || activeComponent !== "jeonju") return;
    setJeonjuUploadOpen(false);
    setJeonjuRecordSearchName("");
    setJeonjuRecordSearchPhone("");
    fetchJeonjuRecordSummary();
    fetchJeonjuRecordList("all", 1, { name: "", phone: "" });
  }, [token, activeComponent]);

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      const data = await response.json();
      localStorage.setItem(STORAGE_KEY, data.access_token);
      setToken(data.access_token);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const onCreateGroup = async (event) => {
    event.preventDefault();
    if (!newGroupName.trim()) return;

    setLoading(true);
    setFormMessage("");
    try {
      const response = await authFetch("/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      const group = await response.json();
      await fetchGroups();
      setSelectedGroupId(String(group.id));
      setNewGroupName("");
      setFormMessage(`그룹 생성 완료: ${group.name}`);
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async (event) => {
    event.preventDefault();
    if (uploadJob && (uploadJob.status === "queued" || uploadJob.status === "processing")) {
      setFormMessage("기존 업로드 작업이 진행 중입니다. 완료 후 다시 시도해주세요.");
      return;
    }
    if (!selectedGroupId) {
      setFormMessage("먼저 그룹을 선택하거나 생성해주세요.");
      return;
    }
    if (uploadFiles.length === 0) {
      setFormMessage("업로드할 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setFormMessage("");
    try {
      const formData = new FormData();
      formData.append("group_id", selectedGroupId);
      uploadFiles.forEach((file) => formData.append("files", file));

      const response = await authFetch("/data/upload/async", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        setFormMessage(`업로드 실패: ${message}`);
        return;
      }

      const result = await response.json();
      const queuedJob = {
        id: result.job_id,
        status: result.status,
        total_files: result.total_files,
        processed_files: 0,
        inserted_records: 0,
        current_file: null,
        error: null,
      };
      setUploadJob(queuedJob);
      setFormMessage("업로드 작업을 시작했습니다. 처리 진행상황을 확인해주세요.");
      clearUploadPoll();
      uploadPollTimerRef.current = setTimeout(() => {
        pollUploadJob(result.job_id);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const onUploadCompare = async (event) => {
    event.preventDefault();
    if (compareFiles.length === 0) {
      setCompareMessage("업로드할 비교군 엑셀(.xlsx)을 선택해주세요.");
      return;
    }

    setLoading(true);
    setCompareMessage("");
    try {
      const formData = new FormData();
      compareFiles.forEach((file) => formData.append("files", file));

      const response = await authFetch("/compare-records/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        setCompareMessage(`업로드 실패: ${message}`);
        return;
      }

      const result = await response.json();
      setCompareFiles([]);
      setCompareInvalidCount(result.invalid_count || 0);
      setCompareErrorBatchId(result.error_batch_id || "");
      setCompareMessage(
        `비교군 업로드 완료: 읽은 행 ${result.rows_read}, 신규 ${result.inserted}, 갱신 ${result.updated}, 오류 ${result.invalid_count}`
      );
      await fetchCompareRecords(1, compareFilter);
    } finally {
      setLoading(false);
    }
  };

  const onUploadSupporters = async (event) => {
    event.preventDefault();
    if (!supporterFile) {
      setSupporterMessage("업로드할 서포터 엑셀(.xlsx)을 선택해주세요.");
      return;
    }

    setLoading(true);
    setSupporterMessage("");
    try {
      const formData = new FormData();
      formData.append("file", supporterFile);
      const response = await authFetch("/supporters/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        setSupporterMessage(`업로드 실패: ${message}`);
        return;
      }

      const result = await response.json();
      setSupporterFile(null);
      if (result.mode === "async") {
        setSupporterUploadJob({
          id: result.job_id,
          status: result.status,
          total_rows: result.total_rows,
          processed_rows: 0,
          inserted: 0,
          skipped_duplicate: 0,
          invalid_count: 0,
          error: null,
        });
        setSupporterMessage("5만 건 초과 데이터로 비동기 업로드를 시작했습니다.");
        clearSupporterUploadPoll();
        supporterUploadPollTimerRef.current = setTimeout(() => {
          pollSupporterUploadJob(result.job_id);
        }, 800);
        return;
      }

      setSupporterUploadJob(null);
      setSupporterMessage(
        `업로드 완료: 읽은 행 ${result.rows_read || 0}, 신규 ${result.inserted || 0}, 중복 제외 ${result.skipped_duplicate || 0}, 오류 ${result.invalid_count || 0}`
      );
      await fetchSupporterStatsSummary();
    } finally {
      setLoading(false);
    }
  };

  const onConvertJeonju = async (event) => {
    event.preventDefault();
    if (!jeonjuConvertFile) {
      setCompareMessage("변환할 전주시 원본 엑셀(.xlsx)을 선택해주세요.");
      return;
    }

    setLoading(true);
    setCompareMessage("");
    try {
      const formData = new FormData();
      formData.append("file", jeonjuConvertFile);
      const response = await authFetch("/convert/jeonju-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text();
        setCompareMessage(`변환 실패: ${message}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "jeonju_converted_compare.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setJeonjuConvertFile(null);
      setCompareMessage("변환 완료: 비교군 샘플 형식 엑셀을 다운로드했습니다.");
    } catch {
      setCompareMessage("변환 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onDownloadCompareTemplate = async () => {
    try {
      const response = await authFetch("/compare-records/template");
      if (!response.ok) {
        setCompareMessage("샘플 엑셀 다운로드에 실패했습니다.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "compare_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setCompareMessage("샘플 엑셀 다운로드 중 문제가 발생했습니다.");
    }
  };

  const onDownloadSupporterTemplate = async () => {
    try {
      const response = await authFetch("/supporters/template");
      if (!response.ok) {
        setSupporterMessage("샘플 엑셀 다운로드에 실패했습니다.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "supporter_template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setSupporterMessage("샘플 엑셀 다운로드 중 문제가 발생했습니다.");
    }
  };

  const onOpenSupporterList = async (scope) => {
    try {
      await fetchSupporterList(1, scope, supporterFilter);
      setSupporterMessage("");
    } catch {
      setSupporterMessage("서포터 리스트를 불러오는 중 문제가 발생했습니다.");
    }
  };

  const onSelectSupporterFilter = async (filter) => {
    setSupporterFilter(filter);
    try {
      await fetchSupporterList(1, supporterListScope, filter);
      setSupporterMessage("");
    } catch {
      setSupporterMessage("서포터 리스트를 불러오는 중 문제가 발생했습니다.");
    }
  };

  const onDownloadSupporterListExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.set("scope", supporterListScope);
      if (supporterFilter.type === "district" && supporterFilter.value) params.set("district_name", supporterFilter.value);
      if (supporterFilter.type === "keyword" && supporterFilter.value) params.set("address_contains", supporterFilter.value);
      const response = await authFetch(`/supporters/export?${params.toString()}`);
      if (!response.ok) {
        setSupporterMessage("서포터 엑셀 다운로드에 실패했습니다.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = supporterListScope === "matched" ? "supporters_matched.xlsx" : "supporters_total.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setSupporterMessage("서포터 엑셀 다운로드 중 문제가 발생했습니다.");
    }
  };

  const onSetJeonjuFile = (category, file) => {
    setJeonjuFiles((prev) => ({ ...prev, [category]: file }));
  };

  const onUploadJeonju = async (e, category) => {
    e.preventDefault();
    const file = jeonjuFiles[category];
    if (!file) {
      setJeonjuMessage("파일을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setJeonjuMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await authFetch(`/jeonju/upload?category=${category}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setJeonjuMessage(`업로드 실패: ${err.detail || response.statusText}`);
        return;
      }
      const result = await response.json();
      const categoryLabels = { all: "전주시 전체", gap: "전주시 갑", eul: "전주시 을", byeong: "전주시 병" };
      setJeonjuMessage(
        `[${categoryLabels[category]}] 읽은 행: ${result.rows_read}, 추가: ${result.inserted}, 중복 제외: ${result.skipped_duplicate}, 오류: ${result.invalid_count}`
      );
      setJeonjuFiles((prev) => ({ ...prev, [category]: null }));
      await fetchJeonjuRecordSummary();
      await fetchJeonjuRecordList(category, 1);
    } catch {
      setJeonjuMessage("업로드 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onSearchJeonjuRecords = async () => {
    await fetchJeonjuRecordList(jeonjuRecordOpenKey, 1, {
      name: jeonjuRecordSearchName,
      phone: jeonjuRecordSearchPhone,
    });
  };

  const onResetJeonjuRecords = async () => {
    setJeonjuRecordSearchName("");
    setJeonjuRecordSearchPhone("");
    await fetchJeonjuRecordList(jeonjuRecordOpenKey, 1, { name: "", phone: "" });
  };

  const onDownloadJeonjuRecordsExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.set("category", jeonjuRecordOpenKey);
      if (jeonjuRecordSearchName.trim()) params.set("name", jeonjuRecordSearchName.trim());
      if (jeonjuRecordSearchPhone.trim()) params.set("phone", jeonjuRecordSearchPhone.trim());
      const response = await authFetch(`/jeonju/records/export?${params.toString()}`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jeonju_records_${jeonjuRecordOpenKey}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onDownloadCompareExcelByKeyword = async (keyword, filename) => {
    try {
      const params = new URLSearchParams();
      params.set("address_contains", keyword);
      const response = await authFetch(`/compare-records/export?${params.toString()}`);
      if (!response.ok) {
        setCompareMessage(`${keyword} 비교군 엑셀 다운로드에 실패했습니다.`);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setCompareMessage(`${keyword} 비교군 엑셀 다운로드 중 문제가 발생했습니다.`);
    }
  };

  const onDownloadCompareExcelByDistrict = async (districtName) => {
    try {
      const params = new URLSearchParams();
      params.set("district_name", districtName);
      const response = await authFetch(`/compare-records/export?${params.toString()}`);
      if (!response.ok) {
        setCompareMessage(`${districtName} 비교군 엑셀 다운로드에 실패했습니다.`);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compare_records_${districtName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setCompareMessage(`${districtName} 비교군 엑셀 다운로드 중 문제가 발생했습니다.`);
    }
  };

  const onSelectCompareFilter = async (filter) => {
    setCompareFilter(filter);
    await fetchCompareRecords(1, filter);
  };

  const onDownloadSelectedCompareFilter = async () => {
    if (compareFilter.type === "district" && compareFilter.value) {
      await onDownloadCompareExcelByDistrict(compareFilter.value);
      return;
    }
    if (compareFilter.type === "keyword" && compareFilter.value) {
      await onDownloadCompareExcelByKeyword(compareFilter.value, `compare_records_${compareFilter.value}.xlsx`);
    }
  };

  const onDownloadCompareErrors = async () => {
    if (!compareErrorBatchId) return;
    try {
      const response = await authFetch(`/compare-records/upload-errors/${compareErrorBatchId}`);
      if (!response.ok) {
        setCompareMessage("오류 목록 다운로드에 실패했습니다.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compare_upload_errors_${compareErrorBatchId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setCompareMessage("오류 목록 다운로드 중 문제가 발생했습니다.");
    }
  };

  const onDownloadDailyStatsExcel = async () => {
    try {
      const response = await authFetch("/stats/daily/export");
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "daily_stats.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onToggleDailyStats = async () => {
    const next = !isDailyStatsOpen;
    setIsDailyStatsOpen(next);
    if (next) {
      await fetchDailyStats();
    }
  };

  const onOpenCombinedContacts = async (scope) => {
    const nextFilter = { type: "all", value: "", label: "전체" };
    setCombinedContactsScope(scope);
    setCombinedContactsFilter(nextFilter);
    navigateTo("combinedContacts");
    if (scope === "matched") {
      await fetchElectionDistricts();
      await fetchCombinedContactCategoryCounts();
    }
    await fetchCombinedContacts(1, scope, nextFilter);
  };

  const onOpenOverallCombinedContacts = async (scope) => {
    const nextFilter = { type: "all", value: "", label: "전체" };
    setOverallListScope(scope);
    setCombinedContactsScope(scope);
    setCombinedContactsFilter(nextFilter);
    if (scope === "matched") {
      await fetchElectionDistricts();
      await fetchCombinedContactCategoryCounts();
    }
    await fetchCombinedContacts(1, scope, nextFilter);
  };

  const onSelectCombinedContactsFilter = async (filter) => {
    setCombinedContactsFilter(filter);
    await fetchCombinedContacts(1, combinedContactsScope, filter);
  };

  const onDownloadCombinedContactsExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.set("scope", combinedContactsScope);
      if (combinedContactsFilter.type === "district" && combinedContactsFilter.value) {
        params.set("district_name", combinedContactsFilter.value);
      }
      if (combinedContactsFilter.type === "keyword" && combinedContactsFilter.value) {
        params.set("address_contains", combinedContactsFilter.value);
      }
      const response = await authFetch(`/stats/combined-contacts/export?${params.toString()}`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = combinedContactsScope === "matched" ? "combined_matched_people.xlsx" : "combined_total_people.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onSelectCity = async (cityName) => {
    const nextCity = cityName || "";
    setJeonjuContactsOpenKey(null);
    setJeonjuOpenOwnersPhone("");
    setSelectedCity(nextCity);
    setSelectedDong("");
    await fetchContacts({
      page: 1,
      city: nextCity,
      dong: "",
      name: searchName,
      phone: searchPhone,
      favoriteOnly: favoriteOnlyContacts,
    });
  };

  const onSelectDong = async (dongName) => {
    const nextDong = dongName || "";
    setJeonjuContactsOpenKey(null);
    setJeonjuOpenOwnersPhone("");
    setSelectedDong(nextDong);
    await fetchContacts({
      page: 1,
      city: selectedCity,
      dong: nextDong,
      name: searchName,
      phone: searchPhone,
      favoriteOnly: favoriteOnlyContacts,
    });
  };

  const onMoveContactPage = async (page) => {
    if (page < 1) return;
    await fetchContacts({
      page,
      city: selectedCity,
      dong: selectedDong,
      name: searchName,
      phone: searchPhone,
      favoriteOnly: favoriteOnlyContacts,
    });
  };

  const onToggleContactOwners = async (phoneNormalized) => {
    if (!phoneNormalized) return;
    if (openOwnersPhone === phoneNormalized) {
      setOpenOwnersPhone("");
      return;
    }
    setOpenOwnersPhone(phoneNormalized);
    if (ownersByPhone[phoneNormalized]) return;

    try {
      setLoadingOwnersPhone(phoneNormalized);
      const owners = await fetchContactOwners(phoneNormalized);
      setOwnersByPhone((prev) => ({ ...prev, [phoneNormalized]: owners }));
    } finally {
      setLoadingOwnersPhone("");
    }
  };

  const onToggleJeonjuOwners = async (phoneNormalized) => {
    if (!phoneNormalized) return;
    if (jeonjuOpenOwnersPhone === phoneNormalized) {
      setJeonjuOpenOwnersPhone("");
      return;
    }
    setJeonjuOpenOwnersPhone(phoneNormalized);
    if (jeonjuOwnersByPhone[phoneNormalized]) return;

    try {
      setJeonjuLoadingOwnersPhone(phoneNormalized);
      const owners = await fetchContactOwners(phoneNormalized, true);
      setJeonjuOwnersByPhone((prev) => ({ ...prev, [phoneNormalized]: owners }));
    } finally {
      setJeonjuLoadingOwnersPhone("");
    }
  };

  const onOpenOwnerDetail = async (ownerId) => {
    await fetchOwnerDetail(ownerId);
    navigateTo("owner");
  };

  const onSelectTreeOwner = async (ownerId) => {
    setSelectedTreeOwnerId(ownerId);
    setTreeOwnerLoading(true);
    setTreeOwnerDetail(null);
    navigateTo("treeOwnerContacts");
    try {
      const data = await fetchOwnerDetail(ownerId);
      setTreeOwnerDetail(data);
    } finally {
      setTreeOwnerLoading(false);
    }
  };

  const onDeleteTreeOwner = async (ownerId, ownerName) => {
    if (!ownerId) return;
    const label = ownerName || "선택한 자식 노드";
    const confirmed = window.confirm(`${label} 노드를 삭제하시겠습니까?\n연결된 지인 연락처 데이터도 함께 삭제됩니다.`);
    if (!confirmed) return;

    try {
      const response = await authFetch(`/owners/${ownerId}`, { method: "DELETE" });
      if (!response.ok) {
        let message = "자식 노드 삭제에 실패했습니다.";
        try {
          const err = await response.json();
          if (err?.detail) message = String(err.detail);
        } catch {
          // ignore
        }
        window.alert(message);
        return;
      }
      await fetchTreeStats();
      await fetchStatsSummary();
    } catch {
      window.alert("자식 노드 삭제 중 문제가 발생했습니다.");
    }
  };

  const onDownloadContactsExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.set("city", selectedCity);
      if (selectedDong) params.set("dong", selectedDong);
      if (searchName) params.set("name", searchName);
      if (searchPhone) params.set("phone", searchPhone);
      if (favoriteOnlyContacts) params.set("favorite_only", "true");
      const query = params.toString();
      const response = await authFetch(`/contacts/export${query ? `?${query}` : ""}`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "contacts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onDownloadJeonjuExcel = async (category) => {
    if (!category) return;
    try {
      const params = new URLSearchParams();
      params.set("category", category);
      if (favoriteOnlyContacts) params.set("favorite_only", "true");
      const response = await authFetch(`/jeonju/contacts/export?${params.toString()}`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jeonju_contacts_${category}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onSearchContacts = async () => {
    await fetchContacts({
      page: 1,
      city: selectedCity,
      dong: selectedDong,
      name: searchName,
      phone: searchPhone,
      favoriteOnly: favoriteOnlyContacts,
    });
  };

  const onResetContactSearch = async () => {
    setSearchName("");
    setSearchPhone("");
    await fetchContacts({
      page: 1,
      city: selectedCity,
      dong: selectedDong,
      name: "",
      phone: "",
      favoriteOnly: favoriteOnlyContacts,
    });
  };

  const onSelectElectionDistrict = async (district) => {
    const next = district || "";
    setSelectedElectionDistrict(next);
    setElectionUnknownOnly(false);
    setElectionSelectedCity("");
    setElectionSelectedDong("");
    await fetchElectionContacts({ page: 1, district: next, unknownOnly: false, city: "", dong: "" });
  };

  const onSelectElectionUnknown = async () => {
    setSelectedElectionDistrict("");
    setElectionUnknownOnly(true);
    setElectionSelectedCity("");
    setElectionSelectedDong("");
    await fetchElectionContacts({ page: 1, district: "", unknownOnly: true, city: "", dong: "" });
  };

  const onSelectElectionCity = async (city) => {
    const nextCity = city || "";
    setElectionSelectedCity(nextCity);
    setElectionSelectedDong("");
    await fetchElectionContacts({
      page: 1,
      district: "",
      unknownOnly: true,
      city: nextCity,
      dong: "",
    });
  };

  const onSelectElectionDong = async (dong) => {
    const nextDong = dong || "";
    setElectionSelectedDong(nextDong);
    await fetchElectionContacts({
      page: 1,
      district: "",
      unknownOnly: true,
      city: electionSelectedCity,
      dong: nextDong,
    });
  };

  const onMoveElectionPage = async (page) => {
    if (page < 1) return;
    await fetchElectionContacts({
      page,
      district: selectedElectionDistrict,
      unknownOnly: electionUnknownOnly,
      city: electionSelectedCity,
      dong: electionSelectedDong,
    });
  };

  const onAddElectionDong = async () => {
    if (!districtToEdit || !newElectionDong.trim()) return;
    const response = await authFetch(`/contacts/election/districts/${encodeURIComponent(districtToEdit)}/dongs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dong: newElectionDong.trim() }),
    });
    if (!response.ok) return;
    setNewElectionDong("");
    await fetchElectionContacts({
      page: 1,
      district: selectedElectionDistrict,
      unknownOnly: electionUnknownOnly,
      city: electionSelectedCity,
      dong: electionSelectedDong,
    });
  };

  const onDeleteElectionDong = async (districtName, dong) => {
    const response = await authFetch(
      `/contacts/election/districts/${encodeURIComponent(districtName)}/dongs/${encodeURIComponent(dong)}`,
      { method: "DELETE" }
    );
    if (!response.ok) return;
    await fetchElectionContacts({
      page: 1,
      district: selectedElectionDistrict,
      unknownOnly: electionUnknownOnly,
      city: electionSelectedCity,
      dong: electionSelectedDong,
    });
  };

  const onDownloadElectionExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedElectionDistrict) params.set("district", selectedElectionDistrict);
      if (electionUnknownOnly) params.set("unknown_only", "true");
      if (electionSelectedCity) params.set("city", electionSelectedCity);
      if (electionSelectedDong) params.set("dong", electionSelectedDong);
      const query = params.toString();
      const response = await authFetch(`/contacts/election/export${query ? `?${query}` : ""}`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "election_contacts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onDownloadTreeOwnerExcel = async () => {
    if (!selectedTreeOwnerId) return;
    try {
      const response = await authFetch(`/owners/${selectedTreeOwnerId}/export`);
      if (!response.ok) return;
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tree_owner_contacts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // no-op
    }
  };

  const onOpenDailyDetail = async (statDate, metric) => {
    navigateTo("dailyDetail");
    await fetchDailyDetail(statDate, metric);
  };

  if (!token) {
    return (
      <main className="container auth-container">
        <h1>지인 비교 로그인</h1>
        <form onSubmit={onLogin} className="auth-form">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="아이디"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
          />
          <button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        {loginError ? <p className="error">{loginError}</p> : null}
      </main>
    );
  }

  return (
    <main className="container">
      <div className="topbar">
        <h1>
          {activeComponent === "main"
            ? "메인"
            : activeComponent === "supporter"
              ? "서포터 비교"
              : activeComponent === "jeonju"
                ? "전주시 데이터"
              : activeComponent === "stats" || activeComponent === "acquaintanceStats" || activeComponent === "combinedContacts" || activeComponent === "todayManagers" || activeComponent === "dailyDetail"
                ? statsMode === "overall"
                  ? "전체통계"
                  : "지인 비교"
              : "지인 비교"}
        </h1>
        <button type="button" onClick={doLogout}>
          로그아웃
        </button>
      </div>
      <button type="button" className="floating-tree-btn" onClick={() => navigateTo("tree")}>
        트리보기
      </button>

      {activeComponent === "main" ? (
        <MainRootPanel
          onOpenAcquaintance={() => navigateTo("home")}
          onOpenSupporter={() => navigateTo("supporter")}
          onOpenOverallStats={() => {
            setStatsMode("overall");
            navigateTo("stats");
          }}
        />
      ) : activeComponent === "supporter" ? (
        <SupporterPanel
          loading={loading}
          supporterView={supporterView}
          setSupporterView={setSupporterView}
          setSupporterFile={setSupporterFile}
          supporterMessage={supporterMessage}
          supporterUploadJob={supporterUploadJob}
          supporterStats={supporterStats}
          supporterListData={supporterListData}
          supporterListScope={supporterListScope}
          supporterFilter={supporterFilter}
          electionDistrictMap={electionDistrictMap}
          onUploadSupporters={onUploadSupporters}
          onDownloadSupporterTemplate={onDownloadSupporterTemplate}
          onRefreshSupporterStats={fetchSupporterStatsSummary}
          onOpenSupporterList={onOpenSupporterList}
          onSelectSupporterFilter={onSelectSupporterFilter}
          onPageMoveSupporterList={(page) => fetchSupporterList(page, supporterListScope, supporterFilter)}
          onDownloadSupporterListExcel={onDownloadSupporterListExcel}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "home" ? (
        <HomePanel
          onOpenForm={() => navigateTo("form")}
          onOpenStats={() => {
            setStatsMode("acquaintance");
            navigateTo("acquaintanceStats");
          }}
          onOpenTree={() => navigateTo("tree")}
          onOpenCompare={() => navigateTo("compare")}
          onOpenJeonju={() => navigateTo("jeonju")}
          onBackToMain={() => navigateTo("main")}
        />
      ) : activeComponent === "jeonju" ? (
        <JeonjuPanel
          loading={loading}
          jeonjuFiles={jeonjuFiles}
          jeonjuMessage={jeonjuMessage}
          jeonjuUploadOpen={jeonjuUploadOpen}
          jeonjuRecordSummary={jeonjuRecordSummary}
          jeonjuRecordData={jeonjuRecordData}
          jeonjuRecordOpenKey={jeonjuRecordOpenKey}
          jeonjuRecordSearchName={jeonjuRecordSearchName}
          jeonjuRecordSearchPhone={jeonjuRecordSearchPhone}
          setJeonjuRecordSearchName={setJeonjuRecordSearchName}
          setJeonjuRecordSearchPhone={setJeonjuRecordSearchPhone}
          onToggleUpload={() => setJeonjuUploadOpen((prev) => !prev)}
          onSetJeonjuFile={onSetJeonjuFile}
          onUploadJeonju={onUploadJeonju}
          onOpenJeonjuRecords={(category) => fetchJeonjuRecordList(category, 1)}
          onSearchJeonjuRecords={onSearchJeonjuRecords}
          onResetJeonjuRecords={onResetJeonjuRecords}
          onDownloadJeonjuRecordsExcel={onDownloadJeonjuRecordsExcel}
          onPageMoveJeonjuRecords={(page) => {
            if (page < 1) return;
            fetchJeonjuRecordList(jeonjuRecordOpenKey, page);
          }}
          onClose={() => navigateTo("home")}
        />
      ) : activeComponent === "form" ? (
        <UploadPanel
          loading={loading}
          groups={groups}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          newGroupName={newGroupName}
          setNewGroupName={setNewGroupName}
          setUploadFiles={setUploadFiles}
          onCreateGroup={onCreateGroup}
          onUpload={onUpload}
          formMessage={formMessage}
          uploadJob={uploadJob}
          onCloseForm={() => navigateTo("main")}
        />
      ) : activeComponent === "compare" ? (
        <ComparePanel
          loading={loading}
          compareFiles={compareFiles}
          setCompareFiles={setCompareFiles}
          setJeonjuConvertFile={setJeonjuConvertFile}
          compareMessage={compareMessage}
          invalidCount={compareInvalidCount}
          onDownloadTemplate={onDownloadCompareTemplate}
          onDownloadErrors={onDownloadCompareErrors}
          compareData={compareData}
          onPageMove={(page) => fetchCompareRecords(page, compareFilter)}
          onConvertJeonju={onConvertJeonju}
          onUploadCompare={onUploadCompare}
          electionDistrictMap={electionDistrictMap}
          onFetchElectionDistricts={fetchElectionDistricts}
          compareFilter={compareFilter}
          onSelectCompareFilter={onSelectCompareFilter}
          onDownloadSelectedCompareFilter={onDownloadSelectedCompareFilter}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "tree" ? (
        <TreePanel
          treeRows={treeRows}
          onSelectTreeOwner={onSelectTreeOwner}
          onDeleteTreeOwner={onDeleteTreeOwner}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "treeOwnerContacts" ? (
        <TreeOwnerContactsPanel
          ownerDetail={treeOwnerDetail}
          loading={treeOwnerLoading}
          onDownloadExcel={onDownloadTreeOwnerExcel}
          onBack={() => navigateTo("tree")}
        />
      ) : activeComponent === "contacts" ? (
        <ContactListPanel
          title={favoriteOnlyContacts ? "찜한 연락처 목록" : "지인 연락처 목록"}
          contactsData={contactsData}
          selectedCity={selectedCity}
          selectedDong={selectedDong}
          searchName={searchName}
          searchPhone={searchPhone}
          setSearchName={setSearchName}
          setSearchPhone={setSearchPhone}
          ownersByPhone={ownersByPhone}
          openOwnersPhone={openOwnersPhone}
          loadingOwnersPhone={loadingOwnersPhone}
          onSelectCity={onSelectCity}
          onSelectDong={onSelectDong}
          onSearch={onSearchContacts}
          onResetSearch={onResetContactSearch}
          onToggleOwners={onToggleContactOwners}
          onOpenOwnerDetail={onOpenOwnerDetail}
          onPageMove={onMoveContactPage}
          onDownloadExcel={onDownloadContactsExcel}
          onOpenElectionContacts={() => navigateTo("electionContacts")}
          onBackToStats={() => navigateTo(statsRootView)}
          onClose={() => navigateTo("main")}
          jeonjuContactsMap={jeonjuContactsMap}
          jeonjuContactsOpenKey={jeonjuContactsOpenKey}
          onToggleJeonjuContacts={(key) => {
            const isOpening = jeonjuContactsOpenKey !== key;
            setJeonjuContactsOpenKey((prev) => (prev === key ? null : key));
            setJeonjuOpenOwnersPhone("");
            if (isOpening) {
              setSelectedCity("");
              setSelectedDong("");
              fetchContacts({
                page: 1,
                city: "",
                dong: "",
                name: searchName,
                phone: searchPhone,
                favoriteOnly: favoriteOnlyContacts,
              });
              fetchJeonjuContacts(key, 1, favoriteOnlyContacts);
            }
          }}
          onJeonjuPageMove={(key, page) => fetchJeonjuContacts(key, page, favoriteOnlyContacts)}
          jeonjuOwnersByPhone={jeonjuOwnersByPhone}
          jeonjuOpenOwnersPhone={jeonjuOpenOwnersPhone}
          jeonjuLoadingOwnersPhone={jeonjuLoadingOwnersPhone}
          onToggleJeonjuOwners={onToggleJeonjuOwners}
          onDownloadJeonjuExcel={onDownloadJeonjuExcel}
        />
      ) : activeComponent === "combinedContacts" ? (
        <CombinedContactsPanel
          data={combinedContactsData}
          scope={combinedContactsScope}
          combinedContactsFilter={combinedContactsFilter}
          electionDistrictMap={electionDistrictMap}
          combinedContactsCategoryCounts={combinedContactsCategoryCounts}
          onSelectCombinedContactsFilter={onSelectCombinedContactsFilter}
          onPageMove={(page) => fetchCombinedContacts(page, combinedContactsScope, combinedContactsFilter)}
          onDownloadExcel={onDownloadCombinedContactsExcel}
          onBackToStats={() => navigateTo(statsRootView)}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "electionContacts" ? (
        <ElectionContactsPanel
          data={electionContactsData}
          selectedDistrict={selectedElectionDistrict}
          unknownOnly={electionUnknownOnly}
          selectedCity={electionSelectedCity}
          selectedDong={electionSelectedDong}
          loading={loading}
          ownersByPhone={ownersByPhone}
          openOwnersPhone={openOwnersPhone}
          loadingOwnersPhone={loadingOwnersPhone}
          onSelectDistrict={onSelectElectionDistrict}
          onSelectUnknown={onSelectElectionUnknown}
          onSelectCity={onSelectElectionCity}
          onSelectDong={onSelectElectionDong}
          onToggleOwners={onToggleContactOwners}
          onOpenOwnerDetail={onOpenOwnerDetail}
          onPageMove={onMoveElectionPage}
          districtToEdit={districtToEdit}
          setDistrictToEdit={setDistrictToEdit}
          newDong={newElectionDong}
          setNewDong={setNewElectionDong}
          onAddDong={onAddElectionDong}
          onDeleteDong={onDeleteElectionDong}
          onDownloadExcel={onDownloadElectionExcel}
          onBackToContacts={() => navigateTo("contacts")}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "todayManagers" ? (
        <TodayManagersPanel
          rows={todayManagerRows}
          onBackToStats={() => navigateTo(statsRootView)}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "dailyDetail" ? (
        <DailyDetailPanel
          detail={dailyDetail}
          loading={dailyDetailLoading}
          error={dailyDetailError}
          onBackToStats={() => navigateTo(statsRootView)}
          onClose={() => navigateTo("main")}
        />
      ) : activeComponent === "owner" ? (
        ownerDetail ? (
          <OwnerDetailPanel ownerDetail={ownerDetail} onBack={() => navigateTo("contacts")} />
        ) : (
          <section>
            <h2>관리인원 개인 데이터</h2>
            <p className="hint">먼저 연락처 목록에서 관리인원을 선택해주세요.</p>
            <button type="button" className="secondary-btn" onClick={() => navigateTo("contacts")}>
              연락처 목록으로
            </button>
          </section>
        )
      ) : activeComponent === "acquaintanceStats" ? (
        <StatsPanel
          summary={statsSummary}
          showUnifiedCards={false}
          isDailyOpen={isDailyStatsOpen}
          dailyRows={dailyStatsRows}
          onToggleDaily={onToggleDailyStats}
          onDownloadDailyExcel={onDownloadDailyStatsExcel}
          onOpenCombinedTotal={() => onOpenCombinedContacts("total")}
          onOpenCombinedMatched={() => onOpenCombinedContacts("matched")}
          onOpenContacts={() => {
            setFavoriteOnlyContacts(false);
            navigateTo("contacts");
          }}
          onOpenFavoriteContacts={() => {
            setFavoriteOnlyContacts(true);
            navigateTo("contacts");
          }}
          onOpenTodayManagers={() => navigateTo("todayManagers")}
          onOpenDailyDetail={onOpenDailyDetail}
          onClose={() => navigateTo("home")}
        />
      ) : (
        <StatsPanel
          summary={statsSummary}
          showUnifiedCards
          overallOnly
          overallListScope={overallListScope}
          overallListData={combinedContactsData}
          combinedContactsFilter={combinedContactsFilter}
          electionDistrictMap={electionDistrictMap}
          combinedContactsCategoryCounts={combinedContactsCategoryCounts}
          isDailyOpen={isDailyStatsOpen}
          dailyRows={dailyStatsRows}
          onToggleDaily={onToggleDailyStats}
          onDownloadDailyExcel={onDownloadDailyStatsExcel}
          onOpenCombinedTotal={() => onOpenOverallCombinedContacts("total")}
          onOpenCombinedMatched={() => onOpenOverallCombinedContacts("matched")}
          onSelectCombinedContactsFilter={onSelectCombinedContactsFilter}
          onPageMoveCombinedContacts={(page) => fetchCombinedContacts(page, overallListScope || combinedContactsScope, combinedContactsFilter)}
          onDownloadCombinedContactsExcel={onDownloadCombinedContactsExcel}
          onOpenContacts={() => {
            setFavoriteOnlyContacts(false);
            navigateTo("contacts");
          }}
          onOpenFavoriteContacts={() => {
            setFavoriteOnlyContacts(true);
            navigateTo("contacts");
          }}
          onOpenTodayManagers={() => navigateTo("todayManagers")}
          onOpenDailyDetail={onOpenDailyDetail}
          onClose={() => navigateTo("main")}
        />
      )}
    </main>
  );
}
