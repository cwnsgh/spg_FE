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
import Script from "next/script";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./RecruitFlows.module.css";
import {
  RECRUIT_ARMY_TYPE_OPTIONS,
  RECRUIT_EXAM_CATEGORY_OPTIONS,
  RECRUIT_SCHOOL_END_OPTIONS,
} from "./recruitApplyStep1Options";
import { toDateInputValue } from "./recruitFormRules";
import RecruitApplyPreview from "./RecruitApplyPreview";

const MAX_LICENCE_ROWS = 7;
const MAX_CAREER_ROWS = 5;

type LangRow = {
  name: string;
  reading: string;
  talking: string;
  writing: string;
};
type SchoolRow = {
  sdate: string;
  edate: string;
  last: string;
  name: string;
  major: string;
  end: string;
};
type ArmyShape = { type: string; cont: string };

interface DaumPostcodeData {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
}

type WindowWithDaum = Window & {
  daum?: {
    Postcode: new (options: {
      oncomplete: (data: DaumPostcodeData) => void;
    }) => { open: () => void };
  };
};

const MAX_SCHOOL_ROWS = 3;
const STEP_NAV_ITEMS: Array<{ step: 1 | 2 | 3 | 4 | 5; label: string }> = [
  { step: 1, label: "기본입력사항" },
  { step: 2, label: "자격 및 경력사항" },
  { step: 3, label: "자기소개서" },
  { step: 4, label: "경력소개서" },
  { step: 5, label: "지원서제출" },
];

const STEP1_UPLOAD_ROWS: {
  type: RecruitUploadType;
  label: string;
  hint: string;
  multiple?: boolean;
}[] = [
  {
    type: "fgrade",
    label: "최종학력 졸업증명서",
    hint: "pdf, jpg, png, gif 만 가능합니다.",
  },
  {
    type: "fscore",
    label: "최종학력 성적증명서",
    hint: "pdf, jpg, png, gif 만 가능합니다.",
  },
  {
    type: "fcerti",
    label: "자격증",
    hint: "pdf, jpg, png, gif 만 가능합니다. 다중선택이 가능합니다. 10개까지 입력가능합니다.",
    multiple: true,
  },
  {
    type: "fcareer",
    label: "경력증명서",
    hint: "pdf, jpg, png, gif 만 가능합니다. 다중선택이 가능합니다. 10개까지 입력가능합니다.",
    multiple: true,
  },
];
type LicenceRow = { date: string; name: string; grade: string; output: string };
type CareerRow = {
  name: string;
  sdate: string;
  edate: string;
  position: string;
  part: string;
  cont: string;
  salary: string;
  location: string;
  reason: string;
  union: string;
};
type AwardRow = { cont: string; date: string; publisher: string };
type HistoryRow = {
  name: string;
  job: string;
  sdate: string;
  edate: string;
  year: string;
  month: string;
  cont: string;
};
type AddShape = {
  trans: string;
  disease: string;
  patriot: string;
  disability: string;
  over: string;
  change: string;
  salary: string;
};

const HISTORY_CONT_MAX = 1000;

function emptyHistoryRow(): HistoryRow {
  return {
    name: "",
    job: "",
    sdate: "",
    edate: "",
    year: "",
    month: "",
    cont: "",
  };
}

function emptyLicenceRow(): LicenceRow {
  return { date: "", name: "", grade: "", output: "" };
}

function emptyCareerRow(): CareerRow {
  return {
    name: "",
    sdate: "",
    edate: "",
    position: "",
    part: "",
    cont: "",
    salary: "",
    location: "",
    reason: "",
    union: "",
  };
}

function emptyAwardRow(): AwardRow {
  return { cont: "", date: "", publisher: "" };
}

function defaultLangRows(): LangRow[] {
  return [
    { name: "영어", reading: "", talking: "", writing: "" },
    { name: "일본어", reading: "", talking: "", writing: "" },
  ];
}

/** 입사일·퇴사일로 근무 기간(년·개월) 계산 — API `year`, `month`와 동일 의미 */
function workPeriodFromDates(
  sdate: string,
  edate: string
): { year: string; month: string } {
  if (!sdate.trim() || !edate.trim()) return { year: "", month: "" };
  const sd = new Date(`${sdate}T12:00:00`);
  const ed = new Date(`${edate}T12:00:00`);
  if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime()) || ed < sd) {
    return { year: "", month: "" };
  }
  const months =
    (ed.getFullYear() - sd.getFullYear()) * 12 +
    (ed.getMonth() - sd.getMonth());
  if (months < 0) return { year: "", month: "" };
  return { year: String(Math.floor(months / 12)), month: String(months % 12) };
}

function norm(v: unknown): string {
  return v == null ? "" : String(v);
}

function emptySchoolRow(): SchoolRow {
  return { sdate: "", edate: "", last: "", name: "", major: "", end: "" };
}

function mapSchool(v: unknown): SchoolRow[] {
  if (!Array.isArray(v) || v.length === 0) return [emptySchoolRow()];
  return v.map((r) => {
    if (!r || typeof r !== "object") return emptySchoolRow();
    const o = r as Record<string, unknown>;
    return {
      sdate: toDateInputValue(norm(o.sdate)),
      edate: toDateInputValue(norm(o.edate)),
      last: norm(o.last),
      name: norm(o.name),
      major: norm(o.major),
      end: norm(o.end),
    };
  });
}

function mapArmyHydrate(v: unknown): ArmyShape {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    return { type: norm(o.type), cont: norm(o.cont) };
  }
  if (Array.isArray(v) && v[0] && typeof v[0] === "object") {
    const o = v[0] as Record<string, unknown>;
    return { type: norm(o.type), cont: norm(o.cont) };
  }
  return { type: "", cont: "" };
}

function mapLicence(v: unknown): LicenceRow[] {
  if (!Array.isArray(v) || v.length === 0) return [emptyLicenceRow()];
  return v.map((r) => {
    if (!r || typeof r !== "object") return emptyLicenceRow();
    const o = r as Record<string, unknown>;
    const pub = norm(o.publisher);
    const out = norm(o.output);
    return {
      date: toDateInputValue(norm(o.date)),
      name: norm(o.name),
      grade: norm(o.grade),
      output: out || pub,
    };
  });
}

function mapCareer(v: unknown): CareerRow[] {
  if (!Array.isArray(v) || v.length === 0) return [emptyCareerRow()];
  return v.map((r) => {
    if (!r || typeof r !== "object") return emptyCareerRow();
    const o = r as Record<string, unknown>;
    return {
      name: norm(o.name),
      sdate: toDateInputValue(norm(o.sdate)),
      edate: toDateInputValue(norm(o.edate)),
      position: norm(o.position),
      part: norm(o.part),
      cont: norm(o.cont),
      salary: norm(o.salary),
      location: norm(o.location),
      reason: norm(o.reason),
      union: norm(o.union),
    };
  });
}

function mapAward(v: unknown): AwardRow[] {
  if (!Array.isArray(v) || v.length === 0) return [emptyAwardRow()];
  return v.map((r) => {
    if (!r || typeof r !== "object") return emptyAwardRow();
    const o = r as Record<string, unknown>;
    const cont = norm(o.cont);
    const name = norm(o.name);
    return {
      cont: cont || name,
      date: toDateInputValue(norm(o.date)),
      publisher: norm(o.publisher),
    };
  });
}

function mapLang(v: unknown): LangRow[] {
  const base = defaultLangRows();
  if (!Array.isArray(v)) return base;
  for (let i = 0; i < 2; i++) {
    const o = v[i];
    if (o && typeof o === "object") {
      const r = o as Record<string, unknown>;
      base[i] = {
        name: i === 0 ? "영어" : "일본어",
        reading: norm(r.reading),
        talking: norm(r.talking),
        writing: norm(r.writing),
      };
    }
  }
  for (let i = 2; i < v.length; i++) {
    const o = v[i];
    if (o && typeof o === "object") {
      const r = o as Record<string, unknown>;
      base.push({
        name: norm(r.name),
        reading: norm(r.reading),
        talking: norm(r.talking),
        writing: norm(r.writing),
      });
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
  if (!v || typeof v !== "object") {
    return {
      trans: "",
      disease: "",
      patriot: "",
      disability: "",
      over: "",
      change: "",
      salary: "",
    };
  }
  const o = v as Record<string, unknown>;
  return {
    trans: norm(o.trans),
    disease: norm(o.disease),
    patriot: norm(o.patriot),
    disability: norm(o.disability),
    over: norm(o.over),
    change: norm(o.change),
    salary: norm(o.salary),
  };
}

function mapHistory(v: unknown): HistoryRow[] {
  if (!Array.isArray(v) || v.length === 0) return [emptyHistoryRow()];
  return v.map((r) => {
    if (!r || typeof r !== "object") return emptyHistoryRow();
    const o = r as Record<string, unknown>;
    const sdate = toDateInputValue(norm(o.sdate));
    const edate = toDateInputValue(norm(o.edate));
    let year = norm(o.year);
    let month = norm(o.month);
    const hasStoredPeriod = year !== "" || month !== "";
    if (!hasStoredPeriod && sdate && edate) {
      const p = workPeriodFromDates(sdate, edate);
      year = p.year;
      month = p.month;
    }
    return {
      name: norm(o.name),
      job: norm(o.job),
      sdate,
      edate,
      year,
      month,
      cont: norm(o.cont).slice(0, HISTORY_CONT_MAX),
    };
  });
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
  const [re_school, setRe_school] = useState<SchoolRow[]>(() =>
    mapSchool(null)
  );
  const [re_army, setRe_army] = useState<ArmyShape>({ type: "", cont: "" });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const lastSavedFingerprintRef = useRef("");
  const [isDirty, setIsDirty] = useState(false);
  const [didInitialHydrate, setDidInitialHydrate] = useState(false);
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [reloadModalSaving, setReloadModalSaving] = useState(false);
  const [reloadModalErr, setReloadModalErr] = useState("");
  const [showApplyPreview, setShowApplyPreview] = useState(false);

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

  const [extraFiles, setExtraFiles] = useState<
    Record<RecruitUploadType, unknown[]>
  >({
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
    for (const t of [
      "fgrade",
      "fscore",
      "fcerti",
      "fcareer",
    ] as RecruitUploadType[]) {
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
    setRe_army(mapArmyHydrate(row.re_army));
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

  const draftFingerprint = JSON.stringify({
    uiStep,
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
    re_img,
    re_school,
    re_army,
    re_licence,
    re_career,
    re_award,
    re_lang,
    re_oa,
    re_add,
    re_profile1,
    re_profile2,
    re_profile3,
    re_profile4,
    re_profile5,
    re_history,
  });

  useEffect(() => {
    if (!didInitialHydrate) return;
    setIsDirty(draftFingerprint !== lastSavedFingerprintRef.current);
  }, [didInitialHydrate, draftFingerprint]);

  useEffect(() => {
    if (didInitialHydrate || loading || reId <= 0) return;
    lastSavedFingerprintRef.current = draftFingerprint;
    setIsDirty(false);
    setDidInitialHydrate(true);
  }, [didInitialHydrate, draftFingerprint, loading, reId]);

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

    const awardOk = re_award.some((r) => r.cont.trim());
    if (!awardOk) missing.push("상벌내용");

    if (
      !re_lang[0]?.reading?.trim() ||
      !re_lang[0]?.talking?.trim() ||
      !re_lang[0]?.writing?.trim()
    )
      missing.push("영어능력(독해/회화/작문)");
    if (
      !re_lang[1]?.reading?.trim() ||
      !re_lang[1]?.talking?.trim() ||
      !re_lang[1]?.writing?.trim()
    )
      missing.push("일어능력(독해/회화/작문)");

    const oaLabels = [
      "Excel 활용 유무",
      "MS-Word 활용 유무",
      "PPT 활용 유무",
      "한컴오피스 활용 유무",
    ];
    oaLabels.forEach((label, i) => {
      if (!String(re_oa[i] ?? "").trim()) missing.push(label);
    });

    const addMap: Array<[keyof AddShape, string]> = [
      ["trans", "통근방법"],
      ["over", "연장근무"],
      ["change", "주야교대근무"],
      ["salary", "희망연봉(만원)"],
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
    const ok = re_history.some(
      (r) => r.name.trim() && r.job.trim() && r.cont.trim()
    );
    if (!ok) missing.push("경력상세소개(회사/기관+직무+상세)");
    return missing;
  };

  const clientValidateStep = (
    step: 1 | 2 | 3 | 4 | 5
  ): { ok: true } | { ok: false; missing: string[]; goto: number } => {
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
    return first
      ? { ok: false, missing: first[1], goto: first[0] }
      : { ok: true };
  };

  const buildStepPayload = (step: 1 | 2 | 3 | 4): Record<string, unknown> => {
    if (step === 1) {
      const re_army_rows =
        re_army.type.trim() || re_army.cont.trim()
          ? [{ type: re_army.type.trim(), cont: re_army.cont.trim() }]
          : [];
      return {
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
        re_army: re_army_rows,
        re_img,
        re_pwd: "",
        re_pwd_confirm: "",
      };
    }
    if (step === 2) {
      const langHead = [
        {
          name: "영어",
          reading: re_lang[0]?.reading.trim() ?? "",
          talking: re_lang[0]?.talking.trim() ?? "",
          writing: re_lang[0]?.writing.trim() ?? "",
        },
        {
          name: "일본어",
          reading: re_lang[1]?.reading.trim() ?? "",
          talking: re_lang[1]?.talking.trim() ?? "",
          writing: re_lang[1]?.writing.trim() ?? "",
        },
      ];
      const langTail = re_lang.slice(2).flatMap((r) => {
        const has =
          r.name.trim() ||
          r.reading.trim() ||
          r.talking.trim() ||
          r.writing.trim();
        if (!has) return [];
        return [
          {
            name: r.name.trim(),
            reading: r.reading.trim(),
            talking: r.talking.trim(),
            writing: r.writing.trim(),
          },
        ];
      });

      return {
        re_licence: re_licence.map((r) => ({
          date: r.date.trim(),
          name: r.name.trim(),
          grade: r.grade.trim(),
          output: r.output.trim(),
        })),
        re_career: re_career.map((r) => ({
          name: r.name.trim(),
          sdate: r.sdate.trim(),
          edate: r.edate.trim(),
          position: r.position.trim(),
          part: r.part.trim(),
          cont: r.cont.trim(),
          salary: r.salary.trim(),
          location: r.location.trim(),
          reason: r.reason.trim(),
          union: r.union.trim(),
        })),
        re_award: re_award.map((r) => {
          const cont = r.cont.trim();
          return {
            name: cont.slice(0, 120),
            cont,
            date: r.date.trim(),
            publisher: r.publisher.trim(),
          };
        }),
        re_lang: [...langHead, ...langTail],
        re_oa: re_oa.map((x) => String(x ?? "").trim()),
        re_add: {
          trans: re_add.trans.trim(),
          disease: re_add.disease.trim(),
          patriot: re_add.patriot.trim(),
          disability: re_add.disability.trim(),
          over: re_add.over.trim(),
          change: re_add.change.trim(),
          salary: re_add.salary.trim(),
        },
      };
    }
    if (step === 3) {
      return {
        re_profile1,
        re_profile2,
        re_profile3,
        re_profile4,
        re_profile5,
      };
    }
    return {
      re_history: re_history.map((h) => ({
        name: h.name,
        job: h.job,
        sdate: h.sdate,
        edate: h.edate,
        year: h.year,
        month: h.month,
        cont: h.cont.slice(0, HISTORY_CONT_MAX),
      })),
    };
  };

  /** 미리보기·인쇄용 — 현재 폼 상태를 서버 저장 형태와 동일하게 합칩니다. */
  const previewApplyBundle = useMemo((): Record<string, unknown> => {
    return {
      re_id: reId,
      re_status: reStatus,
      ...buildStepPayload(1),
      ...buildStepPayload(2),
      ...buildStepPayload(3),
      ...buildStepPayload(4),
    };
    /* buildStepPayload 본문은 draftFingerprint에 포함된 상태에 의존 */
  }, [draftFingerprint, reId, reStatus]);

  const autosaveCurrentStep = useCallback(async () => {
    if (!reId) return;
    const step = uiStep >= 1 && uiStep <= 4 ? (uiStep as 1 | 2 | 3 | 4) : 4;
    await recruitSaveApplyStep(step, buildStepPayload(step), {
      save_mode: "autosave",
    });
    lastSavedFingerprintRef.current = draftFingerprint;
    setIsDirty(false);
  }, [draftFingerprint, reId, uiStep]);

  useEffect(() => {
    if (!didInitialHydrate) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    const handleReloadShortcut = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isReloadShortcut =
        e.key === "F5" || ((e.ctrlKey || e.metaKey) && key === "r");
      if (!isReloadShortcut || !isDirty || saving) return;
      e.preventDefault();

      setReloadModalErr("");
      setShowReloadModal(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleReloadShortcut);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleReloadShortcut);
    };
  }, [autosaveCurrentStep, didInitialHydrate, isDirty, saving]);

  const runManualAutosave = async () => {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      await autosaveCurrentStep();
      setMsg("임시저장되었습니다.");
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("임시저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleReloadAfterAutosave = async () => {
    setReloadModalSaving(true);
    setReloadModalErr("");
    try {
      await autosaveCurrentStep();
      window.location.reload();
    } catch {
      setReloadModalErr(
        "임시저장에 실패했습니다. 저장 없이 새로고침할지 선택해 주세요."
      );
      setReloadModalSaving(false);
    }
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

      await recruitSaveApplyStep(step, buildStepPayload(step));
      lastSavedFingerprintRef.current = draftFingerprint;
      setIsDirty(false);
      setMsg(`${step}단계 저장되었습니다.`);
      await reload();
      if (step === 1) setUiStep(2);
      else if (step === 2) setUiStep(3);
      else if (step === 3) setUiStep(4);
      else if (step === 4) setUiStep(5);
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
          [
            3,
            (x) =>
              [
                "동기와 희망직종",
                "하고 싶은 업무",
                "장래포부",
                "사회활동",
                "장점",
              ].some((k) => x.includes(k)),
          ],
          [4, (x) => ["경력상세소개"].some((k) => x.includes(k))],
        ];
        const target = errToStep.find(([_, pred]) =>
          e.errors.some((x) => pred(x))
        );
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
      if (photoInputRef.current) photoInputRef.current.value = "";
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

  const onExtraUploadMany = async (
    type: RecruitUploadType,
    files: FileList | null
  ) => {
    if (!files?.length) return;
    setErr("");
    try {
      for (const file of Array.from(files)) {
        await recruitUploadFile(type, file);
      }
      await refreshExtra();
      setMsg("파일이 추가되었습니다.");
    } catch (e) {
      if (e instanceof ApiError) setErr(e.message);
      else setErr("업로드에 실패했습니다.");
    }
  };

  const openPostcode = () => {
    const w = window as WindowWithDaum;
    if (!w.daum?.Postcode) {
      setErr("주소 검색을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setErr("");
    new w.daum.Postcode({
      oncomplete: (data) => {
        setRe_zip(data.zonecode);
        setRe_addr1(data.roadAddress || data.jibunAddress || data.address);
        setRe_addr_jibeon(data.jibunAddress || data.address || "");
      },
    }).open();
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
      ? [
          { value: re_work_type, label: re_work_type },
          ...RECRUIT_EXAM_CATEGORY_OPTIONS,
        ]
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

      {/* <p className={styles.lead}>
        지원서 번호 <strong>{reId}</strong> · 진행 단계{" "}
        <strong>{uiStep}</strong>/5
      </p> */}

      <nav className={styles.stepNavTrack} aria-label="지원서 작성 단계">
        {STEP_NAV_ITEMS.map(({ step, label }, idx) => (
          <Fragment key={step}>
            {idx > 0 ? (
              <span className={styles.stepNavArrow} aria-hidden>
                →
              </span>
            ) : null}
            <button
              type="button"
              className={`${styles.stepNavItem} ${uiStep === step ? styles.stepNavItemActive : ""}`}
              aria-current={uiStep === step ? "step" : undefined}
              onClick={() => setUiStep(step)}
            >
              <span className={styles.stepNavNum}>{step}</span>
              <span className={styles.stepNavLabel}>{label}</span>
            </button>
          </Fragment>
        ))}
      </nav>

      {uiStep === 1 && (
        <>
          <Script
            src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
            strategy="afterInteractive"
          />
          <div>
            <h2 className={styles.wizardStepTitle}>1. 기본입력사항</h2>

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
                      이 공고는 모집 직무 목록이 없습니다. 응시부서(직무)를 직접
                      입력해 주세요.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className={styles.step1SectionCard}>
              <h3
                className={`${styles.wizardSubSectionTitle} ${styles.wizardSubSectionTitleTight}`}
              >
                인적사항
              </h3>
              <div className={styles.step1PersonLayout}>
                <div className={styles.photoColumn}>
                  <div className={styles.photoFrame}>
                    {re_img.trim() ? "등록됨" : "사진"}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/*"
                    className={styles.srOnly}
                    aria-hidden
                    tabIndex={-1}
                    onChange={(e) => void onPhoto(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => photoInputRef.current?.click()}
                  >
                    사진 불러오기
                  </button>
                  <p className={styles.hint}>
                    150px × 200px, 100kb 이하의 jpg, png, gif 이미지만
                    가능합니다.
                  </p>
                  {re_img.trim() ? (
                    <p className={styles.hint}>파일명: {re_img}</p>
                  ) : null}
                </div>

                <div className={styles.personFields}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>성명{req}</label>
                      <input
                        value={re_name}
                        onChange={(e) => setRe_name(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>성명(한자){req}</label>
                      <input
                        value={re_name_cn}
                        onChange={(e) => setRe_name_cn(e.target.value)}
                        placeholder="한자성명을 입력해주세요."
                      />
                    </div>
                    <div className={styles.field}>
                      <label>성명(영문){req}</label>
                      <input
                        value={re_name_en}
                        onChange={(e) => setRe_name_en(e.target.value)}
                        placeholder="영문명을 적어주세요"
                      />
                      <p className={styles.hint}>(여권영문성명)</p>
                    </div>
                    <div className={styles.field}>
                      <label>핸드폰{req}</label>
                      <input
                        value={re_hp}
                        onChange={(e) => setRe_hp(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>집전화</label>
                      <input
                        value={re_tel}
                        onChange={(e) => setRe_tel(e.target.value)}
                        placeholder="집전화 번호를 입력해 주세요"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>이메일{req}</label>
                      <input
                        type="email"
                        value={re_email}
                        onChange={(e) => setRe_email(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>생년월일{req}</label>
                      <input
                        type="date"
                        value={re_birth}
                        onChange={(e) => setRe_birth(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>성별{req}</label>
                      <div className={styles.sexRadios}>
                        <label>
                          <input
                            type="radio"
                            name="re_sex"
                            checked={re_sex === "남"}
                            onChange={() => setRe_sex("남")}
                          />
                          남
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="re_sex"
                            checked={re_sex === "여"}
                            onChange={() => setRe_sex("여")}
                          />
                          여
                        </label>
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label>우편번호</label>
                      <input
                        value={re_zip}
                        onChange={(e) => setRe_zip(e.target.value)}
                        placeholder="주소찾기 시 자동 입력"
                      />
                    </div>
                    <div className={`${styles.field} ${styles.full}`}>
                      <label>주소{req}</label>
                      <div className={styles.addrRow}>
                        <input
                          value={re_addr1}
                          onChange={(e) => setRe_addr1(e.target.value)}
                          placeholder="주소를 입력해주세요"
                        />
                        <button
                          type="button"
                          className={styles.btn}
                          onClick={openPostcode}
                        >
                          주소찾기
                        </button>
                      </div>
                    </div>
                    <div className={`${styles.field} ${styles.full}`}>
                      <label>상세주소</label>
                      <input
                        value={re_addr2}
                        onChange={(e) => setRe_addr2(e.target.value)}
                        placeholder="상세주소를 입력해주세요"
                      />
                    </div>
                    <div className={styles.field}>
                      <label>참고</label>
                      <input
                        value={re_addr3}
                        onChange={(e) => setRe_addr3(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>지번주소</label>
                      <input
                        value={re_addr_jibeon}
                        onChange={(e) => setRe_addr_jibeon(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className={styles.wizardSubSectionTitle}>학력사항</h3>
            <p className={styles.hint}>
              최대 {MAX_SCHOOL_ROWS}개까지 가능합니다.
            </p>
            {re_school.map((row, i) => (
              <div key={i} className={styles.arrayBlock}>
                <div className={styles.field}>
                  <label>기간</label>
                  <div className={styles.schoolPeriodRow}>
                    <input
                      type="date"
                      value={row.sdate}
                      onChange={(e) => {
                        const next = [...re_school];
                        next[i] = { ...row, sdate: e.target.value };
                        setRe_school(next);
                      }}
                    />
                    <span>~</span>
                    <input
                      type="date"
                      value={row.edate}
                      onChange={(e) => {
                        const next = [...re_school];
                        next[i] = { ...row, edate: e.target.value };
                        setRe_school(next);
                      }}
                    />
                    <label className={styles.schoolLastCheck}>
                      <input
                        type="checkbox"
                        checked={row.last === "1"}
                        onChange={(e) => {
                          const next = [...re_school];
                          next[i] = {
                            ...row,
                            last: e.target.checked ? "1" : "",
                          };
                          setRe_school(next);
                        }}
                      />
                      최종학력
                    </label>
                  </div>
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>학교명{req}</label>
                  <input
                    value={row.name}
                    onChange={(e) => {
                      const next = [...re_school];
                      next[i] = { ...row, name: e.target.value };
                      setRe_school(next);
                    }}
                    placeholder="학교명을 적어주세요 (서울외 지역은 지역도 적어주세요)"
                  />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>전공{req}</label>
                  <input
                    value={row.major}
                    onChange={(e) => {
                      const next = [...re_school];
                      next[i] = { ...row, major: e.target.value };
                      setRe_school(next);
                    }}
                    placeholder="전공을 적어주세요"
                  />
                </div>
                <div className={`${styles.field} ${styles.full}`}>
                  <label>이수구분</label>
                  <select
                    value={row.end}
                    onChange={(e) => {
                      const next = [...re_school];
                      next[i] = { ...row, end: e.target.value };
                      setRe_school(next);
                    }}
                  >
                    {RECRUIT_SCHOOL_END_OPTIONS.map((o) => (
                      <option key={o.label + o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.schoolToolbar}>
                  <button
                    type="button"
                    className={styles.smallBtn}
                    onClick={() => {
                      if (re_school.length <= 1) {
                        setRe_school([emptySchoolRow()]);
                        return;
                      }
                      setRe_school(re_school.filter((_, j) => j !== i));
                    }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className={styles.smallBtn}
                    disabled={i === 0}
                    onClick={() => {
                      if (i <= 0) return;
                      const next = [...re_school];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setRe_school(next);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.smallBtn}
                    disabled={i >= re_school.length - 1}
                    onClick={() => {
                      if (i >= re_school.length - 1) return;
                      const next = [...re_school];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      setRe_school(next);
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={styles.smallBtn}
              onClick={() => {
                if (re_school.length >= MAX_SCHOOL_ROWS) {
                  setMsg(
                    `학력은 최대 ${MAX_SCHOOL_ROWS}개까지 입력할 수 있습니다.`
                  );
                  return;
                }
                setRe_school([...re_school, emptySchoolRow()]);
              }}
            >
              학력 추가 (+)
            </button>

            <h3 className={styles.wizardSubSectionTitle}>병역사항</h3>
            <div className={styles.row}>
              <div className={`${styles.field} ${styles.full}`}>
                <label>병역구분</label>
                <select
                  value={re_army.type}
                  onChange={(e) =>
                    setRe_army({ ...re_army, type: e.target.value })
                  }
                >
                  {RECRUIT_ARMY_TYPE_OPTIONS.map((o) => (
                    <option key={o.value || "empty"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`${styles.field} ${styles.full}`}>
                <label>병역내용</label>
                <textarea
                  value={re_army.cont}
                  onChange={(e) =>
                    setRe_army({ ...re_army, cont: e.target.value })
                  }
                  placeholder="병역내용을 간단히 적어주세요"
                  rows={3}
                  style={{ minHeight: "8rem" }}
                />
                <p className={styles.hint}>
                  ex) 육군 병장 보병 2년복무, 면제시 간단한 면제사유를
                  적어주세요
                </p>
              </div>
            </div>

            <h3 className={styles.wizardSubSectionTitle}>파일등록</h3>
            <p className={styles.hint}>
              다음 단계로 이동하기 전에 업로드한 뒤, 아래 「다음 단계로」를 눌러
              저장해 주세요.
            </p>
            <p className={styles.hint}>
              파일명은 해당 증명서명으로 수정해 주세요. (ex 운전면허보통1종.jpg,
              컴활1급자격증.pdf …)
            </p>
            {STEP1_UPLOAD_ROWS.map((urow) => (
              <div key={urow.type} className={styles.fileRegRow}>
                <div className={styles.fileRegLabel}>{urow.label}</div>
                <div>
                  <input
                    id={`recruit-step1-file-${urow.type}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,application/pdf,image/*"
                    className={styles.srOnly}
                    multiple={urow.multiple === true}
                    onChange={(e) => {
                      const el = e.target;
                      const files = el.files;
                      void (async () => {
                        if (urow.multiple)
                          await onExtraUploadMany(urow.type, files);
                        else await onExtraUpload(urow.type, files?.[0] ?? null);
                        el.value = "";
                      })();
                    }}
                  />
                  <button
                    type="button"
                    className={styles.tealOutlineBtn}
                    onClick={() =>
                      document
                        .getElementById(`recruit-step1-file-${urow.type}`)
                        ?.click()
                    }
                  >
                    첨부파일 찾기
                  </button>
                  <p className={styles.hint}>{urow.hint}</p>
                  <ul
                    style={{
                      margin: "0.6rem 0 0",
                      paddingLeft: "1.4rem",
                      fontSize: "1.3rem",
                    }}
                  >
                    {(
                      extraFiles[urow.type] as {
                        pf_id?: number;
                        pf_source?: string;
                      }[]
                    ).map((f) => (
                      <li key={f.pf_id}>
                        {f.pf_source}{" "}
                        <button
                          type="button"
                          onClick={() => f.pf_id && void onDeleteFile(f.pf_id)}
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className={`${styles.stack} ${styles.stackCenter}`}>
              <button
                type="button"
                className={styles.btn}
                disabled={saving}
                onClick={() => void runManualAutosave()}
              >
                임시저장하기
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={saving}
                onClick={() => void saveStep(1)}
              >
                다음 단계로 &gt;
              </button>
            </div>
          </div>
        </>
      )}

      {showReloadModal ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reload-modal-title"
          >
            <h4 id="reload-modal-title" className={styles.modalTitle}>
              작성 중인 내용을 임시저장할까요?
            </h4>
            <p className={styles.modalText}>
              확인을 누르면 현재 단계 내용을 임시저장한 뒤 새로고침합니다.
            </p>
            {reloadModalErr ? (
              <p className={styles.error}>{reloadModalErr}</p>
            ) : null}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                disabled={reloadModalSaving}
                onClick={() => void handleReloadAfterAutosave()}
              >
                임시저장 후 새로고침
              </button>
              <button
                type="button"
                className={styles.btn}
                disabled={reloadModalSaving}
                onClick={() => window.location.reload()}
              >
                저장 없이 새로고침
              </button>
              <button
                type="button"
                className={styles.btn}
                disabled={reloadModalSaving}
                onClick={() => {
                  setShowReloadModal(false);
                  setReloadModalErr("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {uiStep === 2 && (
        <div>
          <h2 className={styles.wizardStepTitle}>2. 자격 및 경력사항</h2>

          <h3 className={styles.wizardSubSectionTitle}>자격면허</h3>
          <p className={styles.wizardSubHint}>
            최대 {MAX_LICENCE_ROWS}개까지 가능합니다.
          </p>
          {re_licence.map((row, i) => (
            <div key={`lic-${i}`} className={styles.careerBlock}>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>취득일</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.date}
                    placeholder="취득일을 적어주세요"
                    onChange={(e) => {
                      const n = [...re_licence];
                      n[i] = { ...row, date: e.target.value };
                      setRe_licence(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>자격증/면허명{req}</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.name}
                    placeholder="자격증 및 면허명을 적어주세요"
                    onChange={(e) => {
                      const n = [...re_licence];
                      n[i] = { ...row, name: e.target.value };
                      setRe_licence(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>등급</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.grade}
                    placeholder="등급을 적어주세요 ex) 보통1종 .."
                    onChange={(e) => {
                      const n = [...re_licence];
                      n[i] = { ...row, grade: e.target.value };
                      setRe_licence(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>발급구분</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.output}
                    placeholder="발급처"
                    onChange={(e) => {
                      const n = [...re_licence];
                      n[i] = { ...row, output: e.target.value };
                      setRe_licence(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel} aria-hidden="true" />
                <div className={styles.careerCell}>
                  <div
                    className={styles.careerIconBar}
                    style={{ justifyContent: "flex-end" }}
                  >
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      title="행 추가"
                      aria-label="행 추가"
                      disabled={re_licence.length >= MAX_LICENCE_ROWS}
                      onClick={() => {
                        if (re_licence.length >= MAX_LICENCE_ROWS) return;
                        setRe_licence([...re_licence, emptyLicenceRow()]);
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      disabled={i <= 0}
                      title="위로 이동"
                      aria-label="위로 이동"
                      onClick={() => {
                        if (i <= 0) return;
                        const n = [...re_licence];
                        [n[i - 1], n[i]] = [n[i], n[i - 1]];
                        setRe_licence(n);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      disabled={i >= re_licence.length - 1}
                      title="아래로 이동"
                      aria-label="아래로 이동"
                      onClick={() => {
                        if (i >= re_licence.length - 1) return;
                        const n = [...re_licence];
                        [n[i + 1], n[i]] = [n[i], n[i + 1]];
                        setRe_licence(n);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      title="이 항목 삭제"
                      aria-label="이 항목 삭제"
                      onClick={() => {
                        if (re_licence.length <= 1) {
                          setRe_licence([emptyLicenceRow()]);
                          return;
                        }
                        setRe_licence(re_licence.filter((_, j) => j !== i));
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <h3 className={styles.wizardSubSectionTitle}>경력사항</h3>
          <p className={styles.wizardSubHint}>
            최대 {MAX_CAREER_ROWS}개까지 가능합니다.
          </p>
          {re_career.map((row, i) => (
            <div key={`car-${i}`} className={styles.careerBlock}>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>업체명{req}</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.name}
                    placeholder="업체명을 적어주세요"
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, name: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>근무기간{req}</div>
                <div className={styles.careerCell}>
                  <div className={styles.careerPeriodRow}>
                    <input
                      type="date"
                      className={styles.careerDateInput}
                      value={row.sdate}
                      onChange={(e) => {
                        const n = [...re_career];
                        n[i] = { ...row, sdate: e.target.value };
                        setRe_career(n);
                      }}
                    />
                    <span className={styles.careerTilde}>~</span>
                    <input
                      type="date"
                      className={styles.careerDateInput}
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
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>직위</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.position}
                    placeholder="최종 직위를 적어주세요"
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, position: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>근무부서</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.part}
                    placeholder="근무부서를 적어주세요"
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, part: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>담당업무</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.cont}
                    placeholder="담당업무를 적어주세요"
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, cont: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>연봉</div>
                <div className={styles.careerCell}>
                  <div className={styles.careerPeriodRow}>
                    <input
                      className={styles.careerUnderlineInput}
                      style={{ flex: "1 1 10rem", minWidth: "8rem" }}
                      inputMode="numeric"
                      value={row.salary}
                      placeholder="최종연봉을 적어주세요"
                      onChange={(e) => {
                        const n = [...re_career];
                        n[i] = { ...row, salary: e.target.value };
                        setRe_career(n);
                      }}
                    />
                    <span className={styles.careerTilde}>만원</span>
                  </div>
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>소재지</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.location}
                    placeholder="소재지를 적어주세요"
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, location: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>퇴사사유</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.reason}
                    placeholder="퇴사사유를 적어주세요"
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, reason: e.target.value };
                      setRe_career(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>노조유무</div>
                <div className={styles.careerCell}>
                  <select
                    className={styles.careerUnderlineSelect}
                    value={row.union}
                    onChange={(e) => {
                      const n = [...re_career];
                      n[i] = { ...row, union: e.target.value };
                      setRe_career(n);
                    }}
                  >
                    <option value="">== 유무선택 ==</option>
                    <option value="유">유</option>
                    <option value="무">무</option>
                  </select>
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel} aria-hidden="true" />
                <div className={styles.careerCell}>
                  <div
                    className={styles.careerIconBar}
                    style={{ justifyContent: "flex-end" }}
                  >
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      title="행 추가"
                      aria-label="행 추가"
                      disabled={re_career.length >= MAX_CAREER_ROWS}
                      onClick={() => {
                        if (re_career.length >= MAX_CAREER_ROWS) return;
                        setRe_career([...re_career, emptyCareerRow()]);
                      }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      disabled={i <= 0}
                      title="위로 이동"
                      aria-label="위로 이동"
                      onClick={() => {
                        if (i <= 0) return;
                        const n = [...re_career];
                        [n[i - 1], n[i]] = [n[i], n[i - 1]];
                        setRe_career(n);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      disabled={i >= re_career.length - 1}
                      title="아래로 이동"
                      aria-label="아래로 이동"
                      onClick={() => {
                        if (i >= re_career.length - 1) return;
                        const n = [...re_career];
                        [n[i + 1], n[i]] = [n[i], n[i + 1]];
                        setRe_career(n);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      title="이 항목 삭제"
                      aria-label="이 항목 삭제"
                      onClick={() => {
                        if (re_career.length <= 1) {
                          setRe_career([emptyCareerRow()]);
                          return;
                        }
                        setRe_career(re_career.filter((_, j) => j !== i));
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <h3 className={styles.wizardSubSectionTitle}>상벌사항</h3>
          <p className={styles.wizardSubHint}>
            상벌내용을 1건 이상 입력해 주세요.
          </p>
          {re_award.map((row, i) => (
            <div key={`aw-${i}`} className={styles.careerBlock}>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>상벌내용{req}</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.cont}
                    placeholder="내용을 적어주세요"
                    onChange={(e) => {
                      const n = [...re_award];
                      n[i] = { ...row, cont: e.target.value };
                      setRe_award(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>일자</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.date}
                    placeholder="발급일자"
                    onChange={(e) => {
                      const n = [...re_award];
                      n[i] = { ...row, date: e.target.value };
                      setRe_award(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>상벌기관</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.publisher}
                    placeholder="발급기관"
                    onChange={(e) => {
                      const n = [...re_award];
                      n[i] = { ...row, publisher: e.target.value };
                      setRe_award(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel} aria-hidden="true" />
                <div className={styles.careerCell}>
                  <div
                    className={styles.careerIconBar}
                    style={{ justifyContent: "flex-end" }}
                  >
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      title="행 추가"
                      aria-label="행 추가"
                      onClick={() =>
                        setRe_award([...re_award, emptyAwardRow()])
                      }
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      disabled={i <= 0}
                      title="위로 이동"
                      aria-label="위로 이동"
                      onClick={() => {
                        if (i <= 0) return;
                        const n = [...re_award];
                        [n[i - 1], n[i]] = [n[i], n[i - 1]];
                        setRe_award(n);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      disabled={i >= re_award.length - 1}
                      title="아래로 이동"
                      aria-label="아래로 이동"
                      onClick={() => {
                        if (i >= re_award.length - 1) return;
                        const n = [...re_award];
                        [n[i + 1], n[i]] = [n[i], n[i + 1]];
                        setRe_award(n);
                      }}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={styles.careerIconBtn}
                      title="이 항목 삭제"
                      aria-label="이 항목 삭제"
                      onClick={() => {
                        if (re_award.length <= 1) {
                          setRe_award([emptyAwardRow()]);
                          return;
                        }
                        setRe_award(re_award.filter((_, j) => j !== i));
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <h3 className={styles.wizardSubSectionTitle}>외국어</h3>
          <p className={styles.wizardSubHint}>
            영어, 일본어는 레벨을 선택해 주세요. (독해·작문·회화: 상 / 중 / 하 /
            불가)
          </p>
          {re_lang.map((row, i) => (
            <div key={`lang-${i}`} className={styles.careerBlock}>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>외국어명</div>
                <div className={styles.careerCell}>
                  {i < 2 ? (
                    <span
                      className={styles.careerUnderlineInput}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 600,
                      }}
                    >
                      {i === 0 ? "영어" : "일본어"}
                    </span>
                  ) : (
                    <input
                      className={styles.careerUnderlineInput}
                      value={row.name}
                      placeholder="외국어명을 입력해주세요"
                      onChange={(e) => {
                        const n = [...re_lang];
                        n[i] = { ...row, name: e.target.value };
                        setRe_lang(n);
                      }}
                    />
                  )}
                </div>
              </div>
              {(
                [
                  ["reading", "독해"],
                  ["writing", "작문"],
                  ["talking", "회화"],
                ] as const
              ).map(([k, label]) => (
                <div key={`${i}-${k}`} className={styles.careerRow}>
                  <div className={styles.careerLabel}>
                    {label}
                    {req}
                  </div>
                  <div className={styles.careerCell}>
                    <select
                      className={styles.careerUnderlineSelect}
                      value={row[k]}
                      onChange={(e) => {
                        const n = [...re_lang];
                        n[i] = { ...row, [k]: e.target.value };
                        setRe_lang(n);
                      }}
                    >
                      <option value="">레벨선택</option>
                      {(["상", "중", "하", "불가"] as const).map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {i === 1 ? (
                <div className={styles.careerRow}>
                  <div className={styles.careerLabel} aria-hidden="true" />
                  <div className={styles.careerCell}>
                    <div
                      className={styles.careerIconBar}
                      style={{ justifyContent: "flex-end" }}
                    >
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        title="외국어 행 추가"
                        aria-label="외국어 행 추가"
                        onClick={() =>
                          setRe_lang([
                            ...re_lang,
                            { name: "", reading: "", talking: "", writing: "" },
                          ])
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {i >= 2 ? (
                <div className={styles.careerRow}>
                  <div className={styles.careerLabel} aria-hidden="true" />
                  <div className={styles.careerCell}>
                    <div
                      className={styles.careerIconBar}
                      style={{ justifyContent: "flex-end" }}
                    >
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        title="외국어 행 추가"
                        aria-label="외국어 행 추가"
                        onClick={() =>
                          setRe_lang([
                            ...re_lang.slice(0, i + 1),
                            { name: "", reading: "", talking: "", writing: "" },
                            ...re_lang.slice(i + 1),
                          ])
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        disabled={i <= 2}
                        title="위로 이동"
                        aria-label="위로 이동"
                        onClick={() => {
                          if (i <= 2) return;
                          const n = [...re_lang];
                          [n[i - 1], n[i]] = [n[i], n[i - 1]];
                          setRe_lang(n);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        disabled={i >= re_lang.length - 1}
                        title="아래로 이동"
                        aria-label="아래로 이동"
                        onClick={() => {
                          if (i >= re_lang.length - 1) return;
                          const n = [...re_lang];
                          [n[i + 1], n[i]] = [n[i], n[i + 1]];
                          setRe_lang(n);
                        }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        title="이 외국어 행 삭제"
                        aria-label="이 외국어 행 삭제"
                        onClick={() => {
                          if (re_lang.length <= 2) return;
                          setRe_lang(re_lang.filter((_, j) => j !== i));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          <h3 className={styles.wizardSubSectionTitle}>OA 활용</h3>
          <div className={styles.careerBlock}>
            {(["EXCEL", "MS-Word", "PPT", "한컴오피스"] as const).map(
              (label, i) => (
                <div key={label} className={styles.careerRow}>
                  <div className={styles.careerLabel}>{label}</div>
                  <div className={styles.careerCell}>
                    <select
                      className={styles.careerUnderlineSelect}
                      aria-label={`${label} 가능 여부`}
                      value={re_oa[i] ?? ""}
                      onChange={(e) => {
                        const n = [...re_oa];
                        n[i] = e.target.value;
                        setRe_oa(n);
                      }}
                    >
                      <option value="">가능유무</option>
                      {(["가능", "불가능"] as const).map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            )}
          </div>

          <h3 className={styles.wizardSubSectionTitle}>기타사항</h3>
          <div className={styles.careerBlock}>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>통근방법{req}</div>
              <div className={styles.careerCell}>
                <input
                  className={styles.careerUnderlineInput}
                  value={re_add.trans}
                  placeholder="통근방법을 적어주세요"
                  onChange={(e) =>
                    setRe_add({ ...re_add, trans: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>과거병력</div>
              <div className={styles.careerCell}>
                <input
                  className={styles.careerUnderlineInput}
                  value={re_add.disease}
                  placeholder="과거병력을 적어주세요"
                  onChange={(e) =>
                    setRe_add({ ...re_add, disease: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>보훈대상</div>
              <div className={styles.careerCell}>
                <input
                  className={styles.careerUnderlineInput}
                  value={re_add.patriot}
                  placeholder="보훈대상일 경우 적어주세요"
                  onChange={(e) =>
                    setRe_add({ ...re_add, patriot: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>장애여부</div>
              <div className={styles.careerCell}>
                <input
                  className={styles.careerUnderlineInput}
                  value={re_add.disability}
                  placeholder="장애가 있으실 경우 장애 여부를 적어주세요"
                  onChange={(e) =>
                    setRe_add({ ...re_add, disability: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>연장근무{req}</div>
              <div className={styles.careerCell}>
                <select
                  className={styles.careerUnderlineSelect}
                  value={re_add.over}
                  onChange={(e) =>
                    setRe_add({ ...re_add, over: e.target.value })
                  }
                >
                  <option value="">선택</option>
                  <option value="가능">가능</option>
                  <option value="불가능">불가능</option>
                </select>
              </div>
            </div>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>주야 교대근무{req}</div>
              <div className={styles.careerCell}>
                <select
                  className={styles.careerUnderlineSelect}
                  value={re_add.change}
                  onChange={(e) =>
                    setRe_add({ ...re_add, change: e.target.value })
                  }
                >
                  <option value="">선택</option>
                  <option value="가능">가능</option>
                  <option value="불가능">불가능</option>
                </select>
              </div>
            </div>
            <div className={styles.careerRow}>
              <div className={styles.careerLabel}>희망연봉{req}</div>
              <div className={styles.careerCell}>
                <div className={styles.careerPeriodRow}>
                  <input
                    className={styles.careerUnderlineInput}
                    style={{ flex: "1 1 10rem", minWidth: "8rem" }}
                    inputMode="numeric"
                    value={re_add.salary}
                    placeholder="0"
                    onChange={(e) =>
                      setRe_add({ ...re_add, salary: e.target.value })
                    }
                  />
                  <span className={styles.careerTilde}>만원</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.stack} ${styles.stackCenter}`}>
            <button
              type="button"
              className={styles.btn}
              disabled={saving}
              onClick={() => void runManualAutosave()}
            >
              임시저장하기
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={saving}
              onClick={() => void saveStep(2)}
            >
              다음 단계로 &gt;
            </button>
          </div>
        </div>
      )}

      {uiStep === 3 && (
        <div>
          <h2 className={styles.wizardStepTitle}>3. 자기소개서</h2>
          {(
            [
              [
                re_profile1,
                setRe_profile1,
                "1. 당사를 선택한 동기와 희망직종에 대한 사유를 기술하시오.",
              ],
              [
                re_profile2,
                setRe_profile2,
                "2. 입사 후 하고 싶은 업무와 이를 위해 준비해온 과정을 구체적으로 기술하시오.",
              ],
              [
                re_profile3,
                setRe_profile3,
                "3. 입사 후 본인의 장래포부를 기술하시오.",
              ],
              [
                re_profile4,
                setRe_profile4,
                "4. 대학 동아리 활동, 봉사활동, 사회단체활동에 대한 경험담을 기술하시오.",
              ],
              [
                re_profile5,
                setRe_profile5,
                "5. 본인의 장점 및 보완점을 기술하시오.",
              ],
            ] as const
          ).map(([val, set, label], i) => (
            <div key={i} className={styles.field}>
              <label>
                {label}
                {req}
              </label>
              <textarea
                value={val}
                maxLength={3000}
                onChange={(e) => set(e.target.value.slice(0, 3000))}
              />
              <p className={styles.hint} style={{ textAlign: "right" }}>
                {val.length} / 3,000
              </p>
            </div>
          ))}
          <div className={`${styles.stack} ${styles.stackCenter}`}>
            <button
              type="button"
              className={styles.btn}
              disabled={saving}
              onClick={() => void runManualAutosave()}
            >
              임시저장하기
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={saving}
              onClick={() => void saveStep(3)}
            >
              다음 단계로 &gt;
            </button>
          </div>
        </div>
      )}

      {uiStep === 4 && (
        <div>
          <h2 className={styles.wizardStepTitle}>4. 경력소개서</h2>
          {re_history.map((row, i) => (
            <div key={i} className={styles.careerBlock}>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>회사명</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.name}
                    placeholder="회사명을 적어주세요"
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, name: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>담당업무</div>
                <div className={styles.careerCell}>
                  <input
                    className={styles.careerUnderlineInput}
                    value={row.job}
                    placeholder="담당업무를 적어주세요"
                    onChange={(e) => {
                      const n = [...re_history];
                      n[i] = { ...row, job: e.target.value };
                      setRe_history(n);
                    }}
                  />
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>근무기간</div>
                <div className={styles.careerCell}>
                  <div className={styles.careerPeriodRow}>
                    <input
                      type="date"
                      className={styles.careerDateInput}
                      value={row.sdate}
                      onChange={(e) => {
                        const sdate = e.target.value;
                        setRe_history((prev) => {
                          const next = [...prev];
                          const r = { ...next[i], sdate };
                          const p = workPeriodFromDates(r.sdate, r.edate);
                          r.year = p.year;
                          r.month = p.month;
                          next[i] = r;
                          return next;
                        });
                      }}
                    />
                    <span className={styles.careerTilde}>~</span>
                    <input
                      type="date"
                      className={styles.careerDateInput}
                      value={row.edate}
                      onChange={(e) => {
                        const edate = e.target.value;
                        setRe_history((prev) => {
                          const next = [...prev];
                          const r = { ...next[i], edate };
                          const p = workPeriodFromDates(r.sdate, r.edate);
                          r.year = p.year;
                          r.month = p.month;
                          next[i] = r;
                          return next;
                        });
                      }}
                    />
                    <span className={styles.careerPeriodHint}>
                      (근무기간
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.careerPeriodNum}
                        value={row.year}
                        placeholder=""
                        aria-label="근무 년"
                        maxLength={3}
                        onChange={(e) => {
                          const n = [...re_history];
                          n[i] = {
                            ...row,
                            year: e.target.value.replace(/\D/g, "").slice(0, 3),
                          };
                          setRe_history(n);
                        }}
                      />
                      년
                      <input
                        type="text"
                        inputMode="numeric"
                        className={styles.careerPeriodNum}
                        value={row.month}
                        placeholder=""
                        aria-label="근무 개월"
                        maxLength={2}
                        onChange={(e) => {
                          const n = [...re_history];
                          n[i] = {
                            ...row,
                            month: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 2),
                          };
                          setRe_history(n);
                        }}
                      />
                      개월)
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.careerRow}>
                <div className={styles.careerLabel}>세부경력{req}</div>
                <div className={styles.careerCell}>
                  <textarea
                    className={styles.careerDetailTextarea}
                    value={row.cont}
                    maxLength={HISTORY_CONT_MAX}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, HISTORY_CONT_MAX);
                      const n = [...re_history];
                      n[i] = { ...row, cont: v };
                      setRe_history(n);
                    }}
                  />
                  <div className={styles.careerDetailFooter}>
                    <span className={styles.careerCharCount}>
                      {row.cont.length.toLocaleString("ko-KR")} / 1,000
                    </span>
                    <div className={styles.careerIconBar}>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        title="경력 항목 추가"
                        aria-label="경력 항목 추가"
                        onClick={() =>
                          setRe_history([...re_history, emptyHistoryRow()])
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        disabled={i === 0}
                        title="위로 이동"
                        aria-label="위로 이동"
                        onClick={() => {
                          if (i <= 0) return;
                          const next = [...re_history];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          setRe_history(next);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        disabled={i >= re_history.length - 1}
                        title="아래로 이동"
                        aria-label="아래로 이동"
                        onClick={() => {
                          if (i >= re_history.length - 1) return;
                          const next = [...re_history];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          setRe_history(next);
                        }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={styles.careerIconBtn}
                        title="이 항목 삭제"
                        aria-label="이 항목 삭제"
                        onClick={() => {
                          if (re_history.length <= 1) {
                            setRe_history([emptyHistoryRow()]);
                            return;
                          }
                          setRe_history(re_history.filter((_, j) => j !== i));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className={`${styles.stack} ${styles.stackCenter}`}>
            <button
              type="button"
              className={styles.btn}
              disabled={saving}
              onClick={() => void runManualAutosave()}
            >
              임시저장하기
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={saving}
              onClick={() => void saveStep(4)}
            >
              다음 단계로 &gt;
            </button>
          </div>
        </div>
      )}

      {uiStep === 5 && (
        <div>
          <h2 className={styles.wizardStepTitle}>5. 지원서제출</h2>
          <p className={styles.lead}>
            모든 필수 항목을 입력한 뒤 제출하세요. 제출 후에는 수정할 수
            없습니다.
          </p>
          <div className={styles.stack}>
            <button
              type="button"
              className={styles.btn}
              disabled={saving}
              onClick={() => setShowApplyPreview(true)}
            >
              입사지원서 미리보기
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={saving}
              onClick={() => void submitFinal()}
            >
              최종 제출
            </button>
            <button type="button" className={styles.btn} onClick={onExit}>
              나가기
            </button>
          </div>
        </div>
      )}

      {showApplyPreview ? (
        <div
          className={`${styles.modalBackdrop} ${styles.applyPreviewBackdrop}`}
          role="presentation"
          onClick={() => setShowApplyPreview(false)}
        >
          <div
            className={`${styles.modalCard} ${styles.applyPreviewCard}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-preview-title"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(110rem, 98vw)", maxHeight: "min(90vh, 96rem)", overflowY: "auto" }}
          >
            <h4 id="apply-preview-title" className={styles.modalTitle}>
              입사지원서 미리보기
            </h4>
            <p className={styles.modalText}>
              아래 내용은 현재 작성 중인 화면 기준입니다. 인쇄 시 브라우저 메뉴에서
              &quot;PDF로 저장&quot;을 선택할 수 있습니다.
            </p>
            <div className={`${styles.modalActions} ${styles.applyPreviewActions}`}>
              <button type="button" className={styles.btnPrimary} onClick={() => window.print()}>
                인쇄 / PDF 저장
              </button>
              <button type="button" className={styles.btn} onClick={() => setShowApplyPreview(false)}>
                닫기
              </button>
            </div>
            <RecruitApplyPreview data={previewApplyBundle} postSubject={detail?.subject} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
