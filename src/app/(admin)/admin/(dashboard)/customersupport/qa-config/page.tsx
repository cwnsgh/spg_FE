/** Next.js 페이지: Q&A(또는 문의) 폼/노출 설정. URL `/admin/customersupport/qa-config` */
"use client";

import { ApiError, getAdminQaConfig, updateAdminQaConfig } from "@/api";
import type { AdminQaConfig } from "@/api";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

const yesNoOptions = [
  { value: "1", label: "사용" },
  { value: "0", label: "미사용" },
];

const initialConfig: AdminQaConfig = {
  qa_title: "",
  qa_category: "",
  qa_skin: "",
  qa_mobile_skin: "",
  qa_use_email: "0",
  qa_req_email: "0",
  qa_use_hp: "0",
  qa_req_hp: "0",
  qa_use_sms: "0",
  qa_send_number: "",
  qa_admin_hp: "",
  qa_admin_email: "",
  qa_use_editor: "1",
  qa_subject_len: "60",
  qa_mobile_subject_len: "30",
  qa_page_rows: "15",
  qa_mobile_page_rows: "15",
  qa_image_width: "600",
  qa_upload_size: "1048576",
  qa_insert_content: "",
  qa_include_head: "",
  qa_include_tail: "",
  qa_content_head: "",
  qa_content_tail: "",
  qa_mobile_content_head: "",
  qa_mobile_content_tail: "",
  qa_1_subj: "",
  qa_2_subj: "",
  qa_3_subj: "",
  qa_4_subj: "",
  qa_5_subj: "",
  qa_1: "",
  qa_2: "",
  qa_3: "",
  qa_4: "",
  qa_5: "",
};

const toggleFieldGroups: { key: keyof AdminQaConfig; label: string }[] = [
  { key: "qa_use_email", label: "이메일 사용" },
  { key: "qa_req_email", label: "이메일 필수" },
  { key: "qa_use_hp", label: "휴대폰 사용" },
  { key: "qa_req_hp", label: "휴대폰 필수" },
  { key: "qa_use_sms", label: "SMS 사용" },
  { key: "qa_use_editor", label: "에디터 사용" },
];

const numericFieldGroups: { key: keyof AdminQaConfig; label: string }[] = [
  { key: "qa_subject_len", label: "제목 길이" },
  { key: "qa_mobile_subject_len", label: "모바일 제목 길이" },
  { key: "qa_page_rows", label: "PC 페이지 행 수" },
  { key: "qa_mobile_page_rows", label: "모바일 페이지 행 수" },
  { key: "qa_image_width", label: "이미지 폭" },
  { key: "qa_upload_size", label: "업로드 용량(Byte)" },
];

export default function AdminQaConfigPage() {
  const [formValues, setFormValues] = useState<AdminQaConfig>(initialConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await getAdminQaConfig();
      setFormValues({
        ...initialConfig,
        ...data,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("문의 설정을 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const handleFieldChange = (key: keyof AdminQaConfig, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateAdminQaConfig(formValues);
      setSuccessMessage(response.message ?? "문의 설정이 저장되었습니다.");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("문의 설정 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.eyebrow}>CUSTOMER SUPPORT</p>
          <h3 className={styles.title}>문의 설정</h3>
          <p className={styles.description}>
            문의 게시판의 제목, 카테고리, 필수 입력값, 에디터 사용 여부, 공통 안내 문구를 한
            곳에서 수정할 수 있습니다.
          </p>
        </div>

        <div className={styles.heroActions}>
          <button type="button" className={styles.ghostButton} onClick={() => void fetchConfig()}>
            다시 불러오기
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </section>

      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      {isLoading ? (
        <section className={styles.formCard}>
          <div className={styles.loadingBox}>설정 정보를 불러오는 중입니다.</div>
        </section>
      ) : (
        <>
          <section className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.tableEyebrow}>BASIC</p>
                <h4 className={styles.tableTitle}>기본 설정</h4>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>문의 제목</span>
                <input
                  type="text"
                  value={formValues.qa_title}
                  onChange={(event) => handleFieldChange("qa_title", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>카테고리</span>
                <input
                  type="text"
                  value={formValues.qa_category}
                  onChange={(event) => handleFieldChange("qa_category", event.target.value)}
                  placeholder="예: 회원|포인트|기타"
                />
              </label>

              <label className={styles.field}>
                <span>PC 스킨</span>
                <input
                  type="text"
                  value={formValues.qa_skin}
                  onChange={(event) => handleFieldChange("qa_skin", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>모바일 스킨</span>
                <input
                  type="text"
                  value={formValues.qa_mobile_skin}
                  onChange={(event) => handleFieldChange("qa_mobile_skin", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.tableEyebrow}>OPTIONS</p>
                <h4 className={styles.tableTitle}>입력 옵션</h4>
              </div>
            </div>

            <div className={styles.formGrid}>
              {toggleFieldGroups.map((field) => (
                <label key={field.key} className={styles.field}>
                  <span>{field.label}</span>
                  <select
                    value={formValues[field.key] ?? "0"}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  >
                    {yesNoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              <label className={styles.field}>
                <span>발신 번호</span>
                <input
                  type="text"
                  value={formValues.qa_send_number ?? ""}
                  onChange={(event) => handleFieldChange("qa_send_number", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>관리자 휴대폰</span>
                <input
                  type="text"
                  value={formValues.qa_admin_hp ?? ""}
                  onChange={(event) => handleFieldChange("qa_admin_hp", event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>관리자 이메일</span>
                <input
                  type="email"
                  value={formValues.qa_admin_email ?? ""}
                  onChange={(event) => handleFieldChange("qa_admin_email", event.target.value)}
                />
              </label>

              {numericFieldGroups.map((field) => (
                <label key={field.key} className={styles.field}>
                  <span>{field.label}</span>
                  <input
                    type="number"
                    value={formValues[field.key] ?? ""}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.tableEyebrow}>CONTENT</p>
                <h4 className={styles.tableTitle}>공통 문구 / 레이아웃</h4>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={`${styles.field} ${styles.fullField}`}>
                <span>기본 입력 문구</span>
                <textarea
                  value={formValues.qa_insert_content}
                  onChange={(event) =>
                    handleFieldChange("qa_insert_content", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>include head</span>
                <input
                  type="text"
                  value={formValues.qa_include_head ?? ""}
                  onChange={(event) =>
                    handleFieldChange("qa_include_head", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>include tail</span>
                <input
                  type="text"
                  value={formValues.qa_include_tail ?? ""}
                  onChange={(event) =>
                    handleFieldChange("qa_include_tail", event.target.value)
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>PC 상단 콘텐츠</span>
                <textarea
                  value={formValues.qa_content_head ?? ""}
                  onChange={(event) => handleFieldChange("qa_content_head", event.target.value)}
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>PC 하단 콘텐츠</span>
                <textarea
                  value={formValues.qa_content_tail ?? ""}
                  onChange={(event) => handleFieldChange("qa_content_tail", event.target.value)}
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>모바일 상단 콘텐츠</span>
                <textarea
                  value={formValues.qa_mobile_content_head ?? ""}
                  onChange={(event) =>
                    handleFieldChange("qa_mobile_content_head", event.target.value)
                  }
                />
              </label>

              <label className={`${styles.field} ${styles.fullField}`}>
                <span>모바일 하단 콘텐츠</span>
                <textarea
                  value={formValues.qa_mobile_content_tail ?? ""}
                  onChange={(event) =>
                    handleFieldChange("qa_mobile_content_tail", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.tableEyebrow}>EXTRA</p>
                <h4 className={styles.tableTitle}>추가 필드</h4>
              </div>
            </div>

            <div className={styles.formGrid}>
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className={styles.extraPair}>
                  <label className={styles.field}>
                    <span>{`추가항목 ${index} 제목`}</span>
                    <input
                      type="text"
                      value={formValues[`qa_${index}_subj` as keyof AdminQaConfig] ?? ""}
                      onChange={(event) =>
                        handleFieldChange(
                          `qa_${index}_subj` as keyof AdminQaConfig,
                          event.target.value
                        )
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span>{`추가항목 ${index} 값`}</span>
                    <input
                      type="text"
                      value={formValues[`qa_${index}` as keyof AdminQaConfig] ?? ""}
                      onChange={(event) =>
                        handleFieldChange(
                          `qa_${index}` as keyof AdminQaConfig,
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
