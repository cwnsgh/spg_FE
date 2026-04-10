"use client";

import {
  ApiError,
  deleteAdminSpgCategory,
  getAdminSpgCategories,
  getAdminSpgCategory,
  type AdminSpgCategoryDetail,
  type AdminSpgCategoryRow,
} from "@/api";
import { toBackendAssetUrl } from "@/api/config";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildCategoryTree,
  depthRoleLabel,
  depthShortLabel,
  flattenCategoryTreeDFS,
  getCategoryFullPath,
  getCategoryParentPathLabel,
  type CategoryTreeNode,
} from "../categoryTreeUtils";
import styles from "./page.module.css";
import { CategoryFormModal } from "./CategoryFormModal";

function depthTagClass(depth: number): string {
  if (depth === 1) return styles.depth1;
  if (depth === 2) return styles.depth2;
  if (depth === 3) return styles.depth3;
  return styles.depthN;
}

/** 직속 하위 추가 버튼 문구용 */
function addChildButtonLabel(parentDepth: number): string {
  if (parentDepth === 1) return "2차(중분류) 추가";
  if (parentDepth === 2) return "3차(소분류) 추가";
  return `뎁스 ${parentDepth + 1} 추가`;
}

const TreeRows = memo(function TreeRows({
  nodes,
  expandedIds,
  toggleExpand,
  selectedCaId,
  onSelect,
}: {
  nodes: CategoryTreeNode[];
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  selectedCaId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <>
      {nodes.map((n) => (
        <div key={n.ca_id}>
          <div
            className={`${styles.treeRow} ${
              selectedCaId === n.ca_id ? styles.treeRowSelected : ""
            }`}
            style={{
              paddingLeft: `${Math.max(0, n.depth - 1)}rem`,
            }}
          >
            {n.children.length > 0 ? (
              <button
                type="button"
                className={styles.treeToggle}
                title={expandedIds.has(n.ca_id) ? "접기" : "펼치기"}
                aria-expanded={expandedIds.has(n.ca_id)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(n.ca_id);
                }}
              >
                {expandedIds.has(n.ca_id) ? "▼" : "▶"}
              </button>
            ) : (
              <span className={styles.treeToggleSpacer} aria-hidden />
            )}
            <button
              type="button"
              className={styles.treeLabel}
              onClick={() => onSelect(n.ca_id)}
            >
              <span
                className={`${styles.depthTagMini} ${depthTagClass(n.depth)}`}
              >
                {depthShortLabel(n.depth)}
              </span>
              <span className={styles.treeNameText}>{n.name_ko}</span>
              {n.depth === 1 &&
                n.file_count != null &&
                Number(n.file_count) > 0 && (
                  <span
                    className={styles.treeFileBadge}
                    title="등록된 공통 자료"
                  >
                    자료 {Number(n.file_count)}
                  </span>
                )}
            </button>
          </div>
          {n.children.length > 0 && expandedIds.has(n.ca_id) && (
            <TreeRows
              nodes={n.children}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedCaId={selectedCaId}
              onSelect={onSelect}
            />
          )}
        </div>
      ))}
    </>
  );
});

export default function AdminProductCategoriesPage() {

  const [allRows, setAllRows] = useState<AdminSpgCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());
  const expandedInitRef = useRef(false);

  const [selectedCaId, setSelectedCaId] = useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [parentId, setParentId] = useState<string>("");

  const [selectedDetail, setSelectedDetail] =
    useState<AdminSpgCategoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const treeRoots = useMemo(() => buildCategoryTree(allRows), [allRows]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminSpgCategories();
      setAllRows(data);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "목록을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (selectedCaId == null) {
      setSelectedDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setSelectedDetail(null);
    void getAdminSpgCategory(selectedCaId)
      .then((d) => {
        if (!cancelled) setSelectedDetail(d);
      })
      .catch(() => {
        if (!cancelled) setSelectedDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCaId]);

  useEffect(() => {
    if (allRows.length === 0 || expandedInitRef.current) return;
    expandedInitRef.current = true;
    const roots = buildCategoryTree(allRows);
    setExpandedIds(new Set(roots.map((r) => r.ca_id)));
  }, [allRows]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return flattenCategoryTreeDFS(treeRoots);
    }
    return allRows
      .filter(
        (r) =>
          r.name_ko.toLowerCase().includes(q) ||
          r.name_en.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          a.depth - b.depth || a.sort_order - b.sort_order || a.ca_id - b.ca_id
      );
  }, [allRows, search, treeRoots]);

  const selectedRow = useMemo(
    () => allRows.find((r) => r.ca_id === selectedCaId) ?? null,
    [allRows, selectedCaId]
  );

  const directChildren = useMemo(() => {
    if (selectedCaId == null) return [];
    return allRows
      .filter((r) => r.parent_id === selectedCaId)
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.depth - b.depth || a.ca_id - b.ca_id
      );
  }, [allRows, selectedCaId]);

  const applySearch = () => {
    setSearch(searchInput);
  };

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectCategory = useCallback((id: number) => {
    setSelectedCaId(id);
  }, []);

  const openCreateUnder = (parent: number | null) => {
    setMode("create");
    setEditingId(null);
    setParentId(parent != null ? String(parent) : "");
    setModalOpen(true);
  };

  const openCreateRoot = () => {
    openCreateUnder(null);
  };

  const openEdit = (caId: number) => {
    setMode("edit");
    setEditingId(caId);
    setParentId("");
    setModalOpen(true);
    setSelectedCaId(caId);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setParentId("");
  };

  const handleCategorySaved = useCallback(
    ({ savedEditId }: { savedEditId: number | null }) => {
      void fetchList();
      if (
        selectedCaId != null &&
        savedEditId != null &&
        savedEditId === selectedCaId
      ) {
        void getAdminSpgCategory(selectedCaId)
          .then((d) => setSelectedDetail(d))
          .catch(() => {});
      }
    },
    [fetchList, selectedCaId]
  );

  const handleDelete = async (caId: number) => {
    if (
      !window.confirm(
        "이 카테고리를 삭제하시겠습니까? 하위·연결 데이터는 DB 설정에 따라 함께 삭제될 수 있습니다."
      )
    ) {
      return;
    }
    try {
      await deleteAdminSpgCategory(caId, false);
      if (selectedCaId === caId) setSelectedCaId(null);
      void fetchList();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "삭제에 실패했습니다.");
    }
  };

  const searchActive = Boolean(search.trim());

  return (
    <div className={styles.page}>
      <section className={styles.heroCard}>
        <p className={styles.eyebrow}>제품소개 · 관리</p>
        <h1 className={styles.title}>제품 카테고리</h1>
        <p className={styles.description}>
          <strong>1차(1뎁스)</strong>는 사이트 상단 탭·
          <strong>공통 PDF(자료)</strong>용 대분류입니다. 트리에서 1차를 고른 뒤
          오른쪽 <strong>「공통 자료·정보 수정」</strong>을 누르면 PDF를 바로
          올릴 수 있습니다 (제품 등록과는 별개입니다). 제품은{" "}
          <strong>2·3차</strong>에서 등록합니다. 왼쪽 트리에서 항목을 누르면
          오른쪽에 <strong>직속 하위만</strong> 보입니다.
        </p>
        <div className={styles.legend}>
          <span>
            <span className={`${styles.depthTag} ${styles.depth1}`}>1뎁스</span>
            대분류
          </span>
          <span>
            <span className={`${styles.depthTag} ${styles.depth2}`}>2뎁스</span>
            중분류
          </span>
          <span>
            <span className={`${styles.depthTag} ${styles.depth3}`}>3뎁스</span>
            소분류
          </span>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="이름 검색 — 트리 대신 일치 항목만 목록으로"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
          />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => applySearch()}
          >
            검색
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setSearchInput("");
              setSearch("");
            }}
          >
            검색 해제
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreateRoot}
          >
            1차 대분류 추가 (탭·공통자료)
          </button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>불러오는 중…</div>
        ) : (
          <div className={styles.workbench}>
            <div className={styles.treePanel}>
              <h3 className={styles.panelTitle}>카테고리 트리</h3>
              <p className={styles.panelHint}>
                ▶/▼ 는 펼침. 이름 줄 클릭 시 오른쪽에서 하위 관리.{" "}
                <strong>1뎁스</strong>는 탭 이름 + 공통 PDF를 두는 곳입니다.
              </p>
              {!searchActive ? (
                <div className={styles.treeScroll}>
                  {treeRoots.length === 0 ? (
                    <p className={styles.panelHint}>데이터 없음</p>
                  ) : (
                    <TreeRows
                      nodes={treeRoots}
                      expandedIds={expandedIds}
                      toggleExpand={toggleExpand}
                      selectedCaId={selectedCaId}
                      onSelect={selectCategory}
                    />
                  )}
                </div>
              ) : (
                <div className={styles.treeScroll}>
                  <p className={styles.panelHint}>
                    검색 결과 ({visibleRows.length}건)
                  </p>
                  {visibleRows.map((r) => (
                    <button
                      key={r.ca_id}
                      type="button"
                      className={`${styles.searchHitRow} ${
                        selectedCaId === r.ca_id ? styles.treeRowSelected : ""
                      }`}
                      onClick={() => setSelectedCaId(r.ca_id)}
                    >
                      <span
                        className={`${styles.depthTagMini} ${depthTagClass(r.depth)}`}
                      >
                        {depthShortLabel(r.depth)}
                      </span>
                      <span>{r.name_ko}</span>
                      <span className={styles.searchHitPath}>
                        {getCategoryFullPath(allRows, r.ca_id)}
                      </span>
                    </button>
                  ))}
                  {visibleRows.length === 0 && (
                    <p className={styles.panelHint}>일치 항목 없음</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailPanel}>
              {selectedCaId == null ? (
                <>
                  <h3 className={styles.panelTitle}>작업 영역</h3>
                  <p className={styles.detailLead}>
                    트리나 검색 결과에서 카테고리를 선택하면, 여기에{" "}
                    <strong>그 아래 하위 목록</strong>과 수정·삭제·하위 추가가
                    나타납니다. <strong>1차 대분류</strong>를 고르면 공통 PDF도
                    여기서 관리할 수 있습니다.
                  </p>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={openCreateRoot}
                  >
                    1차 대분류 만들기 (탭·공통 PDF)
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.detailHeader}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        {selectedRow?.name_ko ?? `ID ${selectedCaId}`}
                      </h3>
                      <p className={styles.breadcrumb}>
                        {getCategoryFullPath(allRows, selectedCaId)}
                      </p>
                      <p className={styles.pathLine}>
                        {depthShortLabel(selectedRow?.depth ?? 0)} ·{" "}
                        {depthRoleLabel(selectedRow?.depth ?? 0)} · 직속 상위:{" "}
                        {getCategoryParentPathLabel(allRows, selectedCaId)}
                      </p>
                      {selectedRow?.depth === 1 && (
                        <div className={styles.depth1Info}>
                          <strong>여기서 공통 PDF를 올릴 수 있습니다.</strong>{" "}
                          제품 등록은 2·3차에서 합니다. 절차: <strong>①</strong>{" "}
                          아래 「공통 자료」에서 목록 확인 → <strong>②</strong>{" "}
                          <strong>「공통 자료·정보 수정」</strong> → 모달{" "}
                          <strong>2번</strong> 칸에서 PDF를 넣고 저장하세요.
                        </div>
                      )}
                    </div>
                    <div className={styles.detailActions}>
                      <button
                        type="button"
                        className={
                          selectedRow?.depth === 1
                            ? styles.primaryButton
                            : styles.secondaryButton
                        }
                        onClick={() => void openEdit(selectedCaId)}
                      >
                        {selectedRow?.depth === 1
                          ? "공통 자료·정보 수정"
                          : "이 항목 수정"}
                      </button>
                      <button
                        type="button"
                        className={styles.dangerButton}
                        onClick={() => void handleDelete(selectedCaId)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {selectedRow?.depth === 1 && (
                    <div className={styles.panelFileSection}>
                      <h4 className={styles.subTitle}>공통 자료 (미리보기)</h4>
                      {detailLoading ? (
                        <p className={styles.pathLine}>불러오는 중…</p>
                      ) : !selectedDetail?.files?.length ? (
                        <div className={styles.fileEmptyCta}>
                          <p className={styles.pathLine}>
                            아직 공통 PDF가 없습니다. 아래 버튼은 수정 화면을
                            열고, 모달 <strong>2번</strong> 칸에서 PDF를 넣으면
                            됩니다.
                          </p>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => void openEdit(selectedCaId)}
                          >
                            공통 PDF 올리기
                          </button>
                        </div>
                      ) : (
                        <div className={styles.panelFileTableWrap}>
                          <table className={styles.panelFileTable}>
                            <thead>
                              <tr>
                                <th>표시 제목 (한)</th>
                                <th>표시 제목 (영)</th>
                                <th>원본 파일명</th>
                                <th />
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDetail.files.map((f) => (
                                <tr key={f.file_id}>
                                  <td>{f.title_ko?.trim() || "—"}</td>
                                  <td>{f.title_en?.trim() || "—"}</td>
                                  <td className={styles.monoMuted}>
                                    {f.origin_name}
                                  </td>
                                  <td>
                                    <a
                                      className={styles.panelFileLink}
                                      href={toBackendAssetUrl(f.file_path)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      열기
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedRow &&
                    selectedRow.depth > 1 &&
                    (selectedDetail?.files?.length ?? 0) > 0 && (
                      <p className={styles.pathLine}>
                        이 분류에 첨부{" "}
                        <strong>{selectedDetail?.files?.length}</strong>개 (수정
                        모달에서 관리)
                      </p>
                    )}

                  <div className={styles.childSectionHeader}>
                    <h4 className={styles.subTitle}>
                      직속 하위 ({directChildren.length}개)
                    </h4>
                    {(selectedRow?.depth ?? 0) < 3 && (
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => openCreateUnder(selectedCaId)}
                      >
                        {addChildButtonLabel(selectedRow?.depth ?? 1)}
                      </button>
                    )}
                  </div>
                  {directChildren.length === 0 ? (
                    <p className={styles.pathLine}>
                      아직 하위가 없습니다.
                      {(selectedRow?.depth ?? 0) < 3 ? (
                        <>
                          {" "}
                          <strong>
                            {addChildButtonLabel(selectedRow?.depth ?? 1)}
                          </strong>
                          버튼을 눌러 추가하세요.
                        </>
                      ) : (
                        <> (3차까지라 더 이상 아래 단계는 없습니다)</>
                      )}
                    </p>
                  ) : (
                    <ul className={styles.childList}>
                      {directChildren.map((c) => (
                        <li key={c.ca_id} className={styles.childItem}>
                          <button
                            type="button"
                            className={styles.childSelectBtn}
                            onClick={() => setSelectedCaId(c.ca_id)}
                          >
                            <span
                              className={`${styles.depthTagMini} ${depthTagClass(c.depth)}`}
                            >
                              {depthShortLabel(c.depth)}
                            </span>
                            <span className={styles.childName}>
                              {c.name_ko}
                            </span>
                            <span className={styles.childEn}>{c.name_en}</span>
                          </button>
                          <div className={styles.childRowActions}>
                            <button
                              type="button"
                              className={styles.ghostButton}
                              onClick={() => void openEdit(c.ca_id)}
                            >
                              수정
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <CategoryFormModal
        open={modalOpen}
        onClose={closeModal}
        mode={mode}
        createParentId={parentId}
        editCaId={editingId}
        allRows={allRows}
        onSaved={handleCategorySaved}
      />
    </div>
  );
}
