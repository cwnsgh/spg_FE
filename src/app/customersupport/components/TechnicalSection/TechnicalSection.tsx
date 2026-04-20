"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchProductCategoryTree, type ProductCategoryNode } from "@/api/product";
import { toBackendAssetUrl } from "@/api/config";
import styles from "./TechnicalSection.module.css";

type TechnicalFileItem = {
  fileId: number;
  title: string;
  fileUrl: string;
  categoryName: string;
  categoryNameEn: string;
};

function fileNameFromPath(path: string): string {
  const normalized = path.split("?")[0];
  const seg = normalized.split("/").pop() ?? "";
  return seg || path;
}

function collectDepth1Files(nodes: ProductCategoryNode[]): TechnicalFileItem[] {
  const out: TechnicalFileItem[] = [];
  for (const node of nodes) {
    if (node.depth !== 1 || !node.files?.length) continue;
    for (const file of node.files) {
      out.push({
        fileId: file.file_id,
        title: file.title_ko?.trim() || fileNameFromPath(file.file_path),
        fileUrl: toBackendAssetUrl(file.file_path),
        categoryName: node.name_ko,
        categoryNameEn: node.name_en ?? "",
      });
    }
  }
  return out;
}

export default function TechnicalSection() {
  const [tree, setTree] = useState<ProductCategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchProductCategoryTree()
      .then((res) => {
        if (!cancelled) setTree(res.tree ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("기술자료를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => collectDepth1Files(tree), [tree]);
  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.categoryName.toLowerCase().includes(q) ||
        item.categoryNameEn.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q)
    );
  }, [items, keyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, items.length]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);
  const groupedPagedItems = useMemo(() => {
    const map = new Map<
      string,
      { categoryName: string; categoryNameEn: string; files: TechnicalFileItem[] }
    >();
    for (const item of pagedItems) {
      const key = `${item.categoryName}__${item.categoryNameEn}`;
      if (!map.has(key)) {
        map.set(key, {
          categoryName: item.categoryName,
          categoryNameEn: item.categoryNameEn,
          files: [],
        });
      }
      map.get(key)!.files.push(item);
    }
    return Array.from(map.values());
  }, [pagedItems]);

  return (
    <section className={styles.section} aria-labelledby="technical-heading">
      <h2 id="technical-heading" className={styles.title}>
        기술자료
      </h2>
      <p className={styles.description}>
        1뎁스 분류에 등록된 기술자료를 확인하고 바로 다운로드할 수 있습니다.
      </p>

      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="분류명(한/영) 또는 파일명 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {loading ? (
        <p className={styles.status}>기술자료를 불러오는 중입니다…</p>
      ) : error ? (
        <p className={styles.statusError}>{error}</p>
      ) : items.length === 0 ? (
        <p className={styles.status}>등록된 기술자료가 없습니다.</p>
      ) : filteredItems.length === 0 ? (
        <p className={styles.status}>검색 결과가 없습니다.</p>
      ) : (
        <>
          <div className={styles.listHead} aria-hidden>
            <span>분류</span>
            <span>파일명</span>
            <span>다운로드</span>
          </div>
          <ul className={styles.fileList}>
            {groupedPagedItems.map((group) => (
              <li
                key={`${group.categoryName}-${group.categoryNameEn}`}
                className={styles.groupRow}
              >
                <p className={styles.groupCategory}>
                  {group.categoryName}
                  {group.categoryNameEn ? (
                    <span className={styles.categoryNameEn}>
                      {" "}
                      ({group.categoryNameEn})
                    </span>
                  ) : null}
                </p>
                <ul className={styles.groupFiles}>
                  {group.files.map((item) => (
                    <li key={item.fileId} className={styles.groupFileRow}>
                      <span className={styles.fileTitle}>{item.title}</span>
                      <a
                        href={item.fileUrl}
                        className={styles.downloadBtn}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        다운로드
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                이전
              </button>
              <span className={styles.pageInfo}>
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
