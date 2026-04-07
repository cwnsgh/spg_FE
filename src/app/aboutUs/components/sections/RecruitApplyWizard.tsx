"use client";

import {
  ApiError,
  getRecruitPostDetail,
  recruitDeleteUpload,
  recruitGetApply,
  recruitListUploads,
  RecruitApplyValidationError,
  recruitSaveApplyStep,
  recruitStatusLabel,
  recruitUploadFile,
  type RecruitPostDetail,
  type RecruitUploadType,
} from "@/api";
import { useCallback, useEffect, useState } from "react";
import styles from "./RecruitFlows.module.css";
import { RECRUIT_EXAM_CATEGORY_OPTIONS } from "./recruitApplyStep1Options";
import {
  isValidRecruitPassword,
  RECRUIT_PASSWORD_HINT,
  RECRUIT_PASSWORD_MAX,
  RECRUIT_PASSWORD_MIN,
  toDateInputValue,
} from "./recruitFormRules";

type LangRow = { reading: string; talking: string; writing: string };
type SchoolRow = { name: string; major: string };
type LicenceRow = { name: string };
type CareerRow = { name: string; sdate: string; edate: string };
type AwardRow = { name: string; cont: string };
type HistoryRow = { name: string; job: string; sdate: string; edate: string; cont: string };
type AddShape = { trans: string; over: string; change: string; salary: string };

function norm(v: unknown): string {
  return v == null ? "" : String(v);
}

function mapSchool(v: unknown): SchoolRow[] {
  if (!Array.isArray(v) || v.length === 0) return [{ name: "", major: "" }];
  return v.map((r) =>
    r && typeof r === "object"
      ? { name: norm((r as Record<string, unknown>).name), major: norm((r as Record<string, unknown>).major) }
      : { name: "", major: "" }
  );
}

function mapLicence(v: unknown): LicenceRow[] {
  if (!Array.isArray(v) || v.length === 0) return [{ name: "" }];
  return v.map((r) =>
    r && typeof r === "object"
      ? { name: norm((r as Record<string, unknown>).name) }
      : { name: "" }
  );
}

function mapCareer(v: unknown): CareerRow[] {
  if (!Array.isArray(v) || v.length === 0) return [{ name: "", sdate: "", edate: "" }];
  return v.map((r) =>
    r && typeof r === "object"
      ? {
          name: norm((r as Record<string, unknown>).name),
          sdate: norm((r as Record<string, unknown>).sdate),
          edate: norm((r as Record<string, unknown>).edate),
        }
      : { name: "", sdate: "", edate: "" }
  );
}

function mapAward(v: unknown): AwardRow[] {
  if (!Array.isArray(v) || v.length === 0) return [{ name: "", cont: "" }];
  return v.map((r) =>
    r && typeof r === "object"
      ? {
          name: norm((r as Record<string, unknown>).name),
          cont: norm((r as Record<string, unknown>).cont),
        }
      : { name: "", cont: "" }
  );
}

function mapLang(v: unknown): LangRow[] {
  const base: LangRow[] = [
    { reading: "", talking: "", writing: "" },
    { reading: "", talking: "", writing: "" },
  ];
  if (!Array.isArray(v)) return base;
  for (let i = 0; i < 2; i++) {
    const o = v[i];
    if (o && typeof o === "object") {
      const r = o as Record<string, unknown>;
      base[i] = { reading: norm(r.reading), talking: norm(r.talking), writing: norm(r.writing) };
    }
  }
  return base;
}

function mapOa(v: unknown): string[] {
  if (!Array.isArray(v)) return ["", "", "", ""];
  const o = [...v].slice(0, 4).map((x) => norm(x));
  while (o.length < 4) o.push("");
  return o;
}

function mapAdd(v: unknown): AddShape {
  if (!v || typeof v !== "object")
    return { trans: "", over: "", change: "", salary: "" };
  const o = v as Record<string, unknown>;
  return {
    trans: norm(o.trans),
    over: norm(o.over),
    change: norm(o.change),
    salary: norm(o.salary),
  };
}

function mapHistory(v: unknown): HistoryRow[] {
  if (!Array.isArray(v) || v.length === 0)
    return [{ name: "", job: "", sdate: "", edate: "", cont: "" }];
  return v.map((r) =>
    r && typeof r === "object"
      ? {
          name: norm((r as Record<string, unknown>).name),
          job: norm((r as Record<string, unknown>).job),
          sdate: norm((r as Record<string, unknown>).sdate),
          edate: norm((r as Record<string, unknown>).edate),
          cont: norm((r as Record<string, unknown>).cont),
        }
      : { name: "", job: "", sdate: "", edate: "", cont: "" }
  );
}

interface Props {
  wrId: number;
  onExit: () => void;
}

export default function RecruitApplyWizard({ wrId, onExit }: Props) {
  const [detail, setDetail] = useState<RecruitPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [valErrs, setValErrs] = useState<string[]>([]);
  const [uiStep, setUiStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [reId, setReId] = useState(0);
  const [reStatus, setReStatus] = useState(0);

  const [re_work_type, setRe_work_type] = useState("");
  const [re_work, setRe_work] = useState("");
  const [re_name, setRe_name] = useState("");
  const [re_name_cn, setRe_name_cn] = useState("");
  const [re_name_en, setRe_name_en] = useState("");
  const [re_hp, setRe_hp] = useState("");
  const [re_tel, setRe_tel] = useState("");
  const [re_email, setRe_email] = useState("");
  const [re_birth, setRe_birth] = useState("");
  const [re_sex, setRe_sex] = useState("");
  const [re_zip, setRe_zip] = useState("");
  const [re_addr1, setRe_addr1] = useState("");
  const [re_addr2, setRe_addr2] = useState("");
  const [re_addr3, setRe_addr3] = useState("");
  const [re_addr_jibeon, setRe_addr_jibeon] = useState("");
  const [re_img, setRe_img] = useState("");
  const [re_school, setRe_school] = useState<SchoolRow[]>([{ name: "", major: "" }]);
  const [re_army, setRe_army] = useState<unknown[]>([]);
  const [re_pwd, setRe_pwd] = useState("");
  const [re_pwd_confirm, setRe_pwd_confirm] = useState("");

  const [re_licence, setRe_licence] = useState(mapLicence(null));
  const [re_career, setRe_career] = useState(mapCareer(null));
  const [re_award, setRe_award] = useState(mapAward(null));
  const [re_lang, setRe_lang] = useState(mapLang(null));
  const [re_oa, setRe_oa] = useState(mapOa(null));
  const [re_add, setRe_add] = useState(mapAdd(null));

  const [re_profile1, setRe_profile1] = useState("");
  const [re_profile2, setRe_profile2] = useState("");
  const [re_profile3, setRe_profile3] = useState("");
  const [re_profile4, setRe_profile4] = useState("");
  const [re_profile5, setRe_profile5] = useState("");

  const [re_history, setRe_history] = useState(mapHistory(null));

  const [extraFiles, setExtraFiles] = useState<Record<RecruitUploadType, unknown[]>>({
    recurit: [],
    fgrade: [],
    fscore: [],
    fcerti: [],
    fcareer: [],
  });

  const refreshExtra = useCallback(async () => {
    const next: Record<RecruitUploadType, unknown[]> = {
      recurit: [],
      fgrade: [],
      fscore: [],
      fcerti: [],
      fcareer: [],
    };
    for (const t of ["fgrade", "fscore", "fcerti", "fcareer"] as RecruitUploadType[]) {
      try {
        const r = await recruitListUploads(t);
        next[t] = r.list ?? [];
      } catch {
        next[t] = [];
      }
    }
    setExtraFiles((prev) => ({ ...prev, ...next }));
  }, []);

  const hydrate = useCallback((row: Record<string, unknown>) => {
    setReId(Number(row.re_id ?? 0));
    setReStatus(Number(row.re_status ?? 0));
    setRe_work_type(norm(row.re_work_type));
    setRe_work(norm(row.re_work));
    setRe_name(norm(row.re_name));
    setRe_name_cn(norm(row.re_name_cn));
    setRe_name_en(norm(row.re_name_en));
    setRe_hp(norm(row.re_hp));
    setRe_tel(norm(row.re_tel));
    setRe_email(norm(row.re_email));
    setRe_birth(toDateInputValue(norm(row.re_birth)));
    setRe_sex(norm(row.re_sex));
    setRe_zip(norm(row.re_zip));
    setRe_addr1(norm(row.re_addr1));
    setRe_addr2(norm(row.re_addr2));
    setRe_addr3(norm(row.re_addr3));
    setRe_addr_jibeon(norm(row.re_addr_jibeon));
    setRe_img(norm(row.re_img));
    setRe_school(mapSchool(row.re_school));
    setRe_army(Array.isArray(row.re_army) ? row.re_army : []);
    setRe_licence(mapLicence(row.re_licence));
    setRe_career(mapCareer(row.re_career));
    setRe_award(mapAward(row.re_award));
    setRe_lang(mapLang(row.re_lang));
    setRe_oa(mapOa(row.re_oa));
    setRe_add(mapAdd(row.re_add));
    setRe_profile1(norm(row.re_profile1));
    setRe_profile2(norm(row.re_profile2));
    setRe_profile3(norm(row.re_profile3));
    setRe_profile4(norm(row.re_profile4));
    setRe_profile5(norm(row.re_profile5));
    setRe_history(mapHistory(row.re_history));
    const st = Math.max(1, Math.min(5, Number(row.re_step) || 1));
    setUiStep(st);
  }, []);

  useEffect(() => {
    void getRecruitPostDetail(wrId)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [wrId]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const row = await recruitGetApply();
      hydrate(row);
      await refreshExtra();
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("지원서를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [hydrate, refreshExtra]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const req = <span className={styles.req}>*</span>;

  const step1Missing = (): string[] => {
    const missing: string[] = [];
    if (!re_work_type.trim()) missing.push("응시구분");
    if (!re_work.trim()) missing.push("응시부서");
    if (!re_name.trim()) missing.push("성명");
    if (!re_hp.trim()) missing.push("휴대폰");
    if (!re_email.trim()) missing.push("이메일");
    if (!re_birth.trim()) missing.push("생년월일");
    if (!re_name_cn.trim()) missing.push("성명(한자)");
    if (!re_name_en.trim()) missing.push("성명(영문)");
    if (!re_sex.trim()) missing.push("성별");
    if (!re_addr1.trim()) missing.push("주소");
    if (!re_img.trim()) missing.push("증명사진");

    const schoolOk = re_school.some((r) => r.name.trim() && r.major.trim());
    if (!schoolOk) missing.push("학력(학교명+전공)");

    return missing;
  };

  const step2Missing = (): string[] => {
    const missing: string[] = [];
    const licenceOk = re_licence.some((r) => r.name.trim());
    if (!licenceOk) missing.push("자격/면허");

    const careerOk = re_career.some((r) => r.name.trim() && r.sdate.trim());
    if (!careerOk) missing.push("경력사항(회사/내용+시작일)");

    const awardOk = re_award.some((r) => r.name.trim() || r.cont.trim());
    if (!awardOk) missing.push("상벌내용");

    if (!re_lang[0]?.reading?.trim() || !re_lang[0]?.talking?.trim() || !re_lang[0]?.writing?.trim())
      missing.push("영어능력(독해/회화/작문)");
    if (!re_lang[1]?.reading?.trim() || !re_lang[1]?.talking?.trim() || !re_lang[1]?.writing?.trim())
      missing.push("일어능력(독해/회화/작문)");

    const oaLabels = ["Excel 활용 유무", "MS-Word 활용 유무", "PPT 활용 유무", "한컴오피스 활용 유무"];
    oaLabels.forEach((label, i) => {
      if (!String(re_oa[i] ?? "").trim()) missing.push(label);
    });

    const addMap: Array<[keyof AddShape, string]> = [
      ["trans", "통근방법"],
      ["over", "연장근무"],
      ["change", "주야교대근무"],
      ["salary", "희망연봉"],
    ];
    addMap.forEach(([k, label]) => {
      if (!re_add[k].trim()) missing.push(label);
    });

    return missing;
  };

  const step3Missing = (): string[] => {
    const missing: string[] = [];
    if (!re_profile1.trim()) missing.push("동기와 희망직종");
    if (!re_profile2.trim()) missing.push("하고 싶은 업무");
    if (!re_profile3.trim()) missing.push("장래포부");
    if (!re_profile4.trim()) missing.push("사회활동");
    if (!re_profile5.trim()) missing.push("장점 및 보완점");
    return missing;
  };

  const step4Missing = (): string[] => {
    const missing: string[] = [];
    const ok = re_history.some((r) => r.name.trim() && r.job.trim() && r.cont.trim());
    if (!ok) missing.push("경력상세소개(회사/기관+직무+상세)");
    return missing;
  };

  const clientValidateStep = (step: 1 | 2 | 3 | 4 | 5): { ok: true } | { ok: false; missing: string[]; goto: number } => {
    if (step === 1) {
      const missing = step1Missing();
      return missing.length ? { ok: false, missing, goto: 1 } : { ok: true };
    }
    if (step === 2) {
      const missing = step2Missing();
      return missing.length ? { ok: false, missing, goto: 2 } : { ok: true };
    }
    if (step === 3) {
      const missing = step3Missing();
      return missing.length ? { ok: false, missing, goto: 3 } : { ok: true };
    }
    if (step === 4) {
      const missing = step4Missing();
      return missing.length ? { ok: false, missing, goto: 4 } : { ok: true };
    }

    const all: Array<[number, string[]]> = [
      [1, step1Missing()],
      [2, step2Missing()],
      [3, step3Missing()],
      [4, step4Missing()],
    ];
    const first = all.find(([, m]) => m.length);
    return first ? { ok: false, missing: first[1], goto: first[0] } : { ok: true };
  };

  const saveStep = async (step: 1 | 2 | 3 | 4) => {
    setSaving(true);
    setErr("");
    setMsg("");
    setValErrs([]);
    try {
      const v = clientValidateStep(step);
      if (!v.ok) {
        setUiStep(v.goto);
        setValErrs(v.missing);
        setErr("필수 항목을 확인해 주세요.");
        return;
      }

      if (step === 1) {
        if (re_pwd !== "" || re_pwd_confirm !== "") {
          if (!isValidRecruitPassword(re_pwd) || re_pwd !== re_pwd_confirm) {
            setErr(
              `비밀번호를 변경하는 경우 ${RECRUIT_PASSWORD_HINT}로 입력하고, 확인란과 동일하게 입력해 주세요.`
            );
            return;
          }
        }
        await recruitSaveApplyStep(1, {
          re_work_type,
          re_work,
          re_name,
          re_name_cn,
          re_name_en,
          re_hp,
          re_tel,
          re_email,
          re_birth,
          re_sex,
          re_zip,
          re_addr1,
          re_addr2,
          re_addr3,
          re_addr_jibeon,
          re_school,
          re_army,
          re_img,
          re_pwd,
          re_pwd_confirm,
        });
      } else if (step === 2) {
        await recruitSaveApplyStep(2, {
          re_licence,
          re_career,
          re_award,
          re_lang,
          re_oa,
          re_add,
        });
      } else if (step === 3) {
        await recruitSaveApplyStep(3, {
          re_profile1,
          re_profile2,
          re_profile3,
          re_profile4,
          re_profile5,
        });
      } else {
        await recruitSaveApplyStep(4, { re_history });
      }
      setMsg(`${step}단계 저장되었습니다.`);
      await reload();
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const submitFinal = async () => {
    setSaving(true);
    setErr("");
    setMsg("");
    setValErrs([]);
    try {
      const v = clientValidateStep(5);
      if (!v.ok) {
        setUiStep(v.goto);
        setValErrs(v.missing);
        setErr("필수 항목을 확인해 주세요.");
        return;
      }
      await recruitSaveApplyStep(5, {}, { re_id: reId });
      setMsg("제출이 완료되었습니다.");
      await reload();
    } catch (e) {
      if (e instanceof RecruitApplyValidationError) {
        setValErrs(e.errors);
        setErr("필수 항목을 확인해 주세요.");
        const errToStep: Array<[number, (label: string) => boolean]> = [
          [
            1,
            (x) =>
              [
                "성명(한자)",
                "성명(영문)",
                "성별",
                "주소",
                "증명사진",
                "학력",
                "응시구분",
                "응시부서",
                "성명",
                "휴대폰",
                "이메일",
                "생년월일",
              ].some((k) => x.includes(k)),
          ],
          [
            2,
            (x) =>
              [
                "자격/면허",
                "경력사항",
                "상벌내용",
                "영어능력",
                "일어능력",
                "Excel",
                "MS-Word",
                "PPT",
                "한컴오피스",
                "통근방법",
                "연장근무",
                "주야교대근무",
                "희망연봉",
              ].some((k) => x.includes(k)),
          ],
          [3, (x) => ["동기와 희망직종", "하고 싶은 업무", "장래포부", "사회활동", "장점"].some((k) => x.includes(k))],
          [4, (x) => ["경력상세소개"].some((k) => x.includes(k))],
        ];
        const target = errToStep.find(([_, pred]) => e.errors.some((x) => pred(x)));
        if (target) setUiStep(target[0]);
      } else if (e instanceof ApiError) setErr(e.message);
      else setErr("제출에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (file: File | null) => {
    if (!file) return;
    setErr("");
    try {
      await recruitUploadFile("recurit", file);
      setMsg("증명사진이 등록되었습니다.");
      await reload();
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("업로드에 실패했습니다.");
    }
  };

  const onExtraUpload = async (type: RecruitUploadType, file: File | null) => {
    if (!file) return;
    setErr("");
    try {
      await recruitUploadFile(type, file);
      await refreshExtra();
      setMsg("파일이 추가되었습니다.");
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("업로드에 실패했습니다.");
    }
  };

  const onDeleteFile = async (pf_id: number) => {
    try {
      await recruitDeleteUpload(pf_id);
      await refreshExtra();
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
    }
  };

  if (loading && !reId) {
    return (
      <div className={styles.flow}>
        <p className={styles.lead}>지원서를 불러오는 중…</p>
      </div>
    );
  }

  if (!loading && err && !reId) {
    return (
      <div className={styles.flow}>
        <p className={styles.error}>{err}</p>
        <button type="button" className={styles.btn} onClick={onExit}>
          돌아가기
        </button>
      </div>
    );
  }

  if (reStatus >= 2) {
    return (
      <div className={styles.flow}>
        <p className={styles.success}>
          제출이 완료된 지원서입니다. (상태: {recruitStatusLabel(reStatus)})
        </p>
        <p className={styles.lead}>
          나의 지원현황 탭에서 동일한 정보로 조회할 수 있습니다.
        </p>
        <button type="button" className={styles.btn} onClick={onExit}>
          처음으로
        </button>
      </div>
    );
  }

  const jobs = detail?.positions?.length
    ? detail.positions.map((p) => p.job).filter(Boolean)
    : [];

  const examCategoryChoices =
    re_work_type &&
    !RECRUIT_EXAM_CATEGORY_OPTIONS.some((o) => o.value === re_work_type)
      ? [{ value: re_work_type, label: re_work_type }, ...RECRUIT_EXAM_CATEGORY_OPTIONS]
      : RECRUIT_EXAM_CATEGORY_OPTIONS;

  const deptChoices =
    jobs.length > 0 && re_work && !jobs.includes(re_work)
      ? [...jobs, re_work]
      : jobs;

  return (
    <div className={styles.flow}>
      {err ? <p className={styles.error}>{err}</p> : null}
      {msg ? <p className={styles.success}>{msg}</p> : null}
      {valErrs.length > 0 ? (
        <ul className={styles.error}>
          {valErrs.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : null}

      <p className={styles.lead}>
        지원서 번호 <strong>{reId}</strong> · 진행 단계{" "}
        <strong>{uiStep}</strong>/5
      </p>

      <div className={styles.stepNav}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            className={uiStep === s ? styles.stepNavActive : ""}
            onClick={() => setUiStep(s)}
          >
            {s}단계
          </button>
        ))}
      </div>

      {uiStep === 1 && (
        <div>
          <h3 className={styles.sectionTitle}>1. 지원·인적 정보</h3>

          <div className={styles.row}>
            <div className={`${styles.field} ${styles.full}`}>
              <label>채용공고</label>
              <div className={styles.readOnlyValue}>
                {detail?.subject ?? "공고 제목을 불러오는 중입니다…"}
              </div>
              {detail?.type ? (
                <p className={styles.hint}>공고 유형: {detail.type}</p>
              ) : null}
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>응시구분{req}</label>
              <select
                value={re_work_type}
                onChange={(e) => setRe_work_type(e.target.value)}
                required
              >
                <option value="">응시구분을 선택해주세요</option>
                {examCategoryChoices.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.field} ${styles.full}`}>
              <label>응시부서{req}</label>
              {jobs.length > 0 ? (
                <select
                  value={re_work}
                  onChange={(e) => setRe_work(e.target.value)}
                  required
                >
                  <option value="">응시부서를 선택해주세요</option>
                  {deptChoices.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    value={re_work}
                    onChange={(e) => setRe_work(e.target.value)}
                    placeholder="공고에 직무 목록이 없을 때 직접 입력해 주세요"
                  />
                  <p className={styles.hint}>
                    이 공고는 모집 직무 목록이 없습니다. 응시부서(직무)를 직접 입력해 주세요.
                  </p>
                </>
              )}
            </div>
          </div>

          <h4 className={styles.sectionTitle}>인적사항</h4>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>성명{req}</label>
              <input value={re_name} onChange={(e) => setRe_name(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>성명(한자){req}</label>
              <input value={re_name_cn} onChange={(e) => setRe_name_cn(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>성명(영문){req}</label>
              <input value={re_name_en} onChange={(e) => setRe_name_en(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>휴대폰{req}</label>
              <input value={re_hp} onChange={(e) => setRe_hp(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>유선전화</label>
              <input value={re_tel} onChange={(e) => setRe_tel(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>이메일{req}</label>
              <input value={re_email} onChange={(e) => setRe_email(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>생년월일{req}</label>
              <input
                type="date"
                value={re_birth}
                onChange={(e) => setRe_birth(e.target.value)}
              />
              <p className={styles.hint}>달력에서 선택해 주세요.</p>
            </div>
            <div className={styles.field}>
              <label>성별{req}</label>
              <select value={re_sex} onChange={(e) => setRe_sex(e.target.value)}>
                <option value="">선택</option>
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>우편번호</label>
              <input value={re_zip} onChange={(e) => setRe_zip(e.target.value)} />
            </div>
            <div className={`${styles.field} ${styles.full}`}>
              <label>주소{req}</label>
              <input value={re_addr1} onChange={(e) => setRe_addr1(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>상세주소</label>
              <input value={re_addr2} onChange={(e) => setRe_addr2(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>참고</label>
              <input value={re_addr3} onChange={(e) => setRe_addr3(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>지번주소</label>
              <input
                value={re_addr_jibeon}
                onChange={(e) => setRe_addr_jibeon(e.target.value)}
              />
            </div>
          </div>

          <h4 className={styles.sectionTitle}>학력</h4>
          {re_school.map((row, i) => (
            <div key={i} className={styles.arrayBlock}>
              <div className={styles.arrayRow}>
                <div className={styles.field}>
                  <label>학교명{req}</label>
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const next = [...re_school];
                      next[i] = { ...row, name: e.target.value };
                      setRe_school(next);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label>전공{req}</label>
                  <input
                    value={row.major}
                    onChange={(e) => {
                      const next = [...re_school];
                      next[i] = { ...row, major: e.target.value };
                      setRe_school(next);
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => setRe_school(re_school.filter((_, j) => j !== i))}
              >
                행 삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => setRe_school([...re_school, { name: "", major: "" }])}
          >
            학력 행 추가
          </button>

          <h4 className={styles.sectionTitle}>증명사진 (필수)</h4>
          <p className={styles.hint}>현재 파일: {re_img || "없음"}</p>
          <input type="file" accept="image/*" onChange={(e) => void onPhoto(e.target.files?.[0] ?? null)} />

          <h4 className={styles.sectionTitle}>비밀번호 변경 (선택)</h4>
          <p className={styles.hint}>{RECRUIT_PASSWORD_HINT}.</p>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>새 비밀번호 ({RECRUIT_PASSWORD_HINT})</label>
              <input
                type="password"
                value={re_pwd}
                onChange={(e) => setRe_pwd(e.target.value)}
                autoComplete="new-password"
                minLength={RECRUIT_PASSWORD_MIN}
                maxLength={RECRUIT_PASSWORD_MAX}
                title={RECRUIT_PASSWORD_HINT}
              />
            </div>
            <div className={styles.field}>
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={re_pwd_confirm}
                onChange={(e) => setRe_pwd_confirm(e.target.value)}
                autoComplete="new-password"
                minLength={RECRUIT_PASSWORD_MIN}
                maxLength={RECRUIT_PASSWORD_MAX}
                title={RECRUIT_PASSWORD_HINT}
              />
            </div>
          </div>

          <div className={styles.stack}>
            <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void saveStep(1)}>
              1단계 저장
            </button>
          </div>
        </div>
      )}

      {uiStep === 2 && (
        <div>
          <h3 className={styles.sectionTitle}>2. 경력·어학·OA 등</h3>

          <h4>자격/면허</h4>
          {re_licence.map((row, i) => (
            <div key={i} className={styles.arrayBlock}>
              <div className={styles.field}>
                <label>명칭{req}</label>
                <input
                  value={row.name}
                  onChange={(e) => {
                    const n = [...re_licence];
                    n[i] = { name: e.target.value };
                    setRe_licence(n);
                  }}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => setRe_licence([...re_licence, { name: "" }])}
          >
            행 추가
          </button>

          <h4>경력</h4>
          {re_career.map((row, i) => (
            <div key={i} className={styles.arrayBlock}>
              <div className={styles.arrayRow}>
                <div className={styles.field}>
                  <label>직장/내용{req}</label>
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, name: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label>시작일{req}</label>
                  <input
                    value={row.sdate}
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, sdate: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label>종료일</label>
                  <input
                    value={row.edate}
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, edate: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() =>
              setRe_career([...re_career, { name: "", sdate: "", edate: "" }])
            }
          >
            행 추가
          </button>

          <h4>상벌</h4>
          <p className={styles.hint}>상벌은 1건 이상 입력해야 하며, 제목 또는 내용 중 하나만 입력해도 됩니다.</p>
          {re_award.map((row, i) => (
            <div key={i} className={styles.arrayBlock}>
              <div className={styles.arrayRow}>
                <div className={styles.field}>
                  <label>제목</label>
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const n = [...re_award];
                      n[i] = { ...row, name: e.target.value };
                      setRe_award(n);
                    }}
                  />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>내용</label>
                  <textarea
                    value={row.cont}
                    onChange={(e) => {
                      const n = [...re_award];
                      n[i] = { ...row, cont: e.target.value };
                      setRe_award(n);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => setRe_award([...re_award, { name: "", cont: "" }])}
          >
            행 추가
          </button>

          <h4>영어 / 일어</h4>
          {re_lang.map((row, i) => (
            <div key={i} className={styles.arrayBlock}>
              <p className={styles.hint}>{i === 0 ? "영어" : "일본어"}</p>
              <div className={styles.arrayRow}>
                {(
                  [
                    ["reading", "독해"],
                    ["writing", "작문"],
                    ["talking", "회화"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k} className={styles.field}>
                    <label>{label}{req}</label>
                    <input
                      value={row[k]}
                      onChange={(e) => {
                        const n = [...re_lang];
                        n[i] = { ...row, [k]: e.target.value };
                        setRe_lang(n);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <h4>OA 능력 (4항목)</h4>
          <div className={styles.arrayRow}>
            {["Excel", "MS-Word", "PPT", "한컴오피스"].map((label, i) => (
              <div key={label} className={styles.field}>
                <label>{label}{req}</label>
                <input
                  value={re_oa[i] ?? ""}
                  onChange={(e) => {
                    const n = [...re_oa];
                    n[i] = e.target.value;
                    setRe_oa(n);
                  }}
                />
              </div>
            ))}
          </div>

          <h4>추가 정보</h4>
          <div className={styles.row}>
            {(
              [
                ["trans", "통근방법"],
                ["over", "연장근무"],
                ["change", "주야교대"],
                ["salary", "희망연봉"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={styles.field}>
                <label>{label}{req}</label>
                <input
                  value={re_add[key]}
                  onChange={(e) => setRe_add({ ...re_add, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <h4>첨부 (성적표·자격증·경력 등)</h4>
          {(["fgrade", "fscore", "fcerti", "fcareer"] as RecruitUploadType[]).map((t) => (
            <div key={t} className={styles.arrayBlock}>
              <p>
                <strong>{t}</strong> 업로드
              </p>
              <input
                type="file"
                onChange={(e) => void onExtraUpload(t, e.target.files?.[0] ?? null)}
              />
              <ul>
                {(extraFiles[t] as { pf_id?: number; pf_source?: string }[]).map((f) => (
                  <li key={f.pf_id}>
                    {f.pf_source}{" "}
                    <button type="button" onClick={() => f.pf_id && void onDeleteFile(f.pf_id)}>
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={styles.stack}>
            <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void saveStep(2)}>
              2단계 저장
            </button>
          </div>
        </div>
      )}

      {uiStep === 3 && (
        <div>
          <h3 className={styles.sectionTitle}>3. 자기소개서</h3>
          {(
            [
              [re_profile1, setRe_profile1, "동기와 희망직종"],
              [re_profile2, setRe_profile2, "하고 싶은 업무"],
              [re_profile3, setRe_profile3, "장래포부"],
              [re_profile4, setRe_profile4, "사회활동"],
              [re_profile5, setRe_profile5, "장점 및 보완점"],
            ] as const
          ).map(([val, set, label], i) => (
            <div key={i} className={styles.field}>
              <label>{label}{req}</label>
              <textarea value={val} onChange={(e) => set(e.target.value)} />
            </div>
          ))}
          <div className={styles.stack}>
            <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void saveStep(3)}>
              3단계 저장
            </button>
          </div>
        </div>
      )}

      {uiStep === 4 && (
        <div>
          <h3 className={styles.sectionTitle}>4. 경력 상세</h3>
          {re_history.map((row, i) => (
            <div key={i} className={styles.arrayBlock}>
              <div className={styles.arrayRow}>
                <div className={styles.field}>
                  <label>회사/기관{req}</label>
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, name: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label>직무{req}</label>
                  <input
                    value={row.job}
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, job: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label>시작</label>
                  <input
                    value={row.sdate}
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, sdate: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
                <div className={styles.field}>
                  <label>종료</label>
                  <input
                    value={row.edate}
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, edate: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>상세{req}</label>
                  <textarea
                    value={row.cont}
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, cont: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => setRe_history(re_history.filter((_, j) => j !== i))}
              >
                행 삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() =>
              setRe_history([
                ...re_history,
                { name: "", job: "", sdate: "", edate: "", cont: "" },
              ])
            }
          >
            행 추가
          </button>
          <div className={styles.stack}>
            <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void saveStep(4)}>
              4단계 저장
            </button>
          </div>
        </div>
      )}

      {uiStep === 5 && (
        <div>
          <h3 className={styles.sectionTitle}>5. 최종 제출</h3>
          <p className={styles.lead}>
            모든 필수 항목을 입력한 뒤 제출하세요. 제출 후에는 수정할 수 없습니다.
          </p>
          <div className={styles.stack}>
            <button type="button" className={styles.btnPrimary} disabled={saving} onClick={() => void submitFinal()}>
              최종 제출
            </button>
            <button type="button" className={styles.btn} onClick={onExit}>
              나가기
            </button>
          </div>
        </div>
      )}

      <div className={styles.stack}>
        <button type="button" className={styles.btn} onClick={onExit}>
          공고 선택으로
        </button>
        <button type="button" className={styles.btn} disabled={loading} onClick={() => void reload()}>
          새로고침
        </button>
      </div>
    </div>
  );
}
