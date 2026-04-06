"use client";

import {
  ApiError,
  BoardPostDetail,
  getBoardPostDetail,
  toBackendAssetUrl,
} from "@/api";
import HeroBanner from "@/app/components/HeroBanner";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "@/app/components/Breadcrumb";
import styles from "./IRAnnouncementDetail.module.css";
import aboutUsBanner from "@/assets/aboutus_banner.png";

const DETAIL_DEDUPE_WINDOW_MS = 2000;
const detailCache = new Map<
  string,
  { data: BoardPostDetail; fetchedAt: number }
>();
const pendingDetailRequests = new Map<string, Promise<BoardPostDetail>>();
const irTabs = [
  { label: "공시정보", value: 0 },
  { label: "IR공고", value: 1 },
  { label: "IR콘텐츠", value: 2 },
  { label: "IR행사", value: 3 },
  { label: "IR 자료실", value: 4 },
];

interface IRBoardDetailProps {
  postId: number;
  boardTable: string;
  listPath: string;
  sectionLabel: string;
  activeTab: number;
}

export default function IRBoardDetail({
  postId,
  boardTable,
  listPath,
  sectionLabel,
  activeTab,
}: IRBoardDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      if (!Number.isInteger(postId) || postId <= 0) {
        setPost(null);
        setErrorMessage("올바른 게시글 정보가 아닙니다.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const cacheKey = `${boardTable}:${postId}`;
        const cached = detailCache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.fetchedAt < DETAIL_DEDUPE_WINDOW_MS) {
          setPost(cached.data);
          return;
        }

        let request = pendingDetailRequests.get(cacheKey);

        if (!request) {
          request = getBoardPostDetail(boardTable, postId);
          pendingDetailRequests.set(cacheKey, request);
        }

        const data = await request;
        detailCache.set(cacheKey, { data, fetchedAt: now });
        pendingDetailRequests.delete(cacheKey);
        setPost(data);
      } catch (error) {
        pendingDetailRequests.delete(`${boardTable}:${postId}`);
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(`${sectionLabel} 상세 정보를 불러오지 못했습니다.`);
        }
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [boardTable, postId, sectionLabel]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "홈", href: "/" },
    { label: "IR정보", href: listPath },
    { label: sectionLabel, href: listPath },
    { label: post?.subject || "상세보기" },
  ];

  return (
    <main className={styles.main}>
      <HeroBanner
        title="IR정보"
        tabs={irTabs}
        activeTab={activeTab}
        backgroundImage={aboutUsBanner.src}
        onTabChange={(tab) => {
          router.push(`/Irinformation?tab=${tab}`);
        }}
      />

      <div className={styles.content}>
        <div className={styles.breadcrumbArea}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <section className={styles.detailSection}>
          {isLoading ? (
            <div className={styles.stateBox}>상세 정보를 불러오는 중입니다.</div>
          ) : errorMessage ? (
            <div className={styles.stateBox}>{errorMessage}</div>
          ) : !post ? (
            <div className={styles.stateBox}>게시글을 찾을 수 없습니다.</div>
          ) : (
            <>
              <div className={styles.header}>
                <div className={styles.headerBadges}>
                  {post.is_notice && (
                    <span className={styles.noticeBadge}>공지</span>
                  )}
                  <span className={styles.sectionBadge}>{sectionLabel}</span>
                </div>
                <h1 className={styles.title}>{post.subject}</h1>
                <div className={styles.metaRow}>
                  <span>
                    <strong>작성자</strong>
                    {post.writer}
                  </span>
                  <span>
                    <strong>작성일</strong>
                    {post.datetime}
                  </span>
                  <span>
                    <strong>조회수</strong>
                    {post.hit}
                  </span>
                </div>
              </div>

              {post.files.length > 0 && (
                <div className={styles.attachmentBox}>
                  <div className={styles.attachmentHeader}>
                    <h2 className={styles.attachmentTitle}>첨부파일</h2>
                    <span className={styles.attachmentCount}>
                      {post.files.length}개
                    </span>
                  </div>
                  <ul className={styles.attachmentList}>
                    {post.files.map((file, index) => (
                      <li key={`${file.bf_file}-${index}`}>
                        <a
                          href={toBackendAssetUrl(
                            `/data/file/${boardTable}/${file.bf_file}`
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className={styles.attachmentName}>
                            {file.bf_source}
                          </span>
                          <span className={styles.attachmentMeta}>
                            다운로드
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <article
                className={styles.contentBody}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className={styles.actionRow}>
                <Link href={listPath} className={styles.listButton}>
                  목록
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
