"use client";

import styles from "./Ethics.module.css";

export default function Ethics() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>윤리규정</h2>

      <div className={styles.content}>
        {/* 제1장 총칙 */}
        <section className={styles.chapter}>
          <h3 className={styles.chapterTitle}>제1장 총칙</h3>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제1조(목적)</h4>
            <p className={styles.articleContent}>
              본 규정은 윤리헌장의 가치를 실현하기 위하여 ㈜에스피지(이하
              &quot;회사&quot;)의 모든 이해관계자에 대한 윤리 규범을 정하고
              윤리실천과 관련된 구체적인 내용 및 절차를 명확히 함을 목적으로
              한다.
            </p>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제2조(용어의 정의)</h4>
            <div className={styles.articleContent}>
              <p>
                <strong>1. &quot;윤리&quot;란</strong> 행위의 옳고 그름과 선악을
                구분하여 원칙이면서 행동의 기준이 되는 가치 체계로 인간으로서
                마땅히 행하거나 지켜야 할 도리를 말한다.
              </p>
              <p>
                <strong>2. &quot;윤리경영&quot;이라 함은</strong> 다음 사항이
                적극 반영된 경영을 말한다.
              </p>
              <ol className={styles.subList}>
                <li>
                  회사의 제반 경영활동이 법률뿐만 아니라 사회통념에 의하여
                  형성된 윤리적 기준을 자발적으로 지켜 나아가는 경영
                </li>
                <li>
                  회사 내의 모든 의사결정과 임직원들의 행동이 윤리적이며
                  합법적인 활동이 되기 위한 내부통제 실행 시스템 및 제도적
                  장치가 마련된 경영
                </li>
                <li>
                  비윤리적 행위나 위법행위 등을 방지하기 위한 자기단속체계가
                  구축된 경영
                </li>
              </ol>
              <p>
                <strong>3. &quot;이해관계자&quot;라 함은</strong> 당사 및 당사
                임직원과의 이해관계를 가지는 개인이나 집단을 통틀어 말한다.
              </p>
            </div>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제3조(적용대상)</h4>
            <p className={styles.articleContent}>
              본 규정은 회사의 모든 임직원(경영권을 행사하는 계열사 포함), 각종
              거래 관계를 갖는 이해관계자에게 적용하며, 윤리경영과 관련된 내용은
              인사관련 규정에서 정한 사항보다 우선하여 적용한다.
            </p>
          </div>
        </section>

        {/* 제2장 조직 및 교육 */}
        <section className={styles.chapter}>
          <h3 className={styles.chapterTitle}>제2장 조직 및 교육</h3>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제4조(조직)</h4>
            <ol className={styles.articleList}>
              <li>
                총무팀은 윤리경영 정책결정 및 관련 제반 규정 등을 제정하고
                인사위원회의 승인을 얻어 주관한다.
              </li>
              <li>본 규정의 지원 조직은 주관부서를 제외한 전 부서로 한다.</li>
              <li>인사위원회는 윤리 경영 전반을 관장한다.</li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제5조(교육 훈련)</h4>
            <ol className={styles.articleList}>
              <li>
                윤리규정의 지속적인 실천을 위해 임직원 및 외부 이해관계자에 대해
                관련 교육을 실시한다.
              </li>
              <li>
                내부 임직원의 경우 연 1회 의무교육으로 진행하며, 외부
                이해관계자는 당사 홈페이지 등에 게시함을 원칙으로 한다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제3장 내부통제 */}
        <section className={styles.chapter}>
          <h3 className={styles.chapterTitle}>제3장 내부통제</h3>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제6조(내부통제)</h4>
            <ol className={styles.articleList}>
              <li>
                회사는 임직원이 윤리경영관련 규정 등을 준수토록 하고, 위반
                행위를 예방 또는 조기 발견할 수 있는 내부통제체제를 운영한다.
              </li>
              <li>
                총무팀장은 임직원이 윤리경영에 위반되는 행위와 관련 규정 등을
                위반하였는지에 대하여 점검 및 조사할 수 있다.
              </li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제7조(위반행위 등의 신고)</h4>
            <ol className={styles.articleList}>
              <li>
                임직원은 임직원의 윤리경영 위반 행위를 한 사실을 알게 된 때에는
                이를 즉시 총무팀장에게 신고하여야 하며, 위반할 우려가 있다고
                판단되는 경우에는 그 내용을 정보로 제공하여야 한다.
              </li>
              <li>
                신고자는 비위자의 인적 사항과 비위사실(6하원칙) 및 그 증거 등을
                함께 제시하여야 하며, 신고 경로는 하기 방법을 통한다.
                <ol className={styles.subList}>
                  <li>위반행위 신고 전용 창구 메일(spg112@spg.co.kr)</li>
                  <li>총무팀장 직통 내선 전화 신고</li>
                  <li>대면 신고</li>
                </ol>
              </li>
              <li>
                신고자는 총무팀장 또는 인사위원회에서 사건의 해결을 위하여
                요청하는 추가적인 질문 및 서류에 대해 적극 협조하여야 한다.
              </li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>
              제8조(위반행위 등 신고에 대한 처리)
            </h4>
            <ol className={styles.articleList}>
              <li>
                총무팀장은 신고 접수 후 3일 이내에 처리 절차에 대한 내용을
                신고자에게 고지한다.
              </li>
              <li>
                총무팀장은 신고 받은 내용을 조사, 확인하여 처벌, 제도 개선 등
                적절한 조치에 대한 사항을 인사위원회에 상정하여 처벌, 제도개선
                등 적절한 조치를 취하여야 한다.
              </li>
              <li>
                연루된 이해관계자에 대해서는 사안의 경중을 고려하여 거래중단 등
                적절한 조치하고 직접 또는 간접적 연루된 인원의 필요 조치를
                의뢰하되, 당사의 손실분에 대해서는 이해관계자에게 변상 조치를
                취한다.
              </li>
              <li>
                총무팀장 또는 인사위원회는 사건 조사 결과 뇌물수수, 횡령, 공문서
                위조등과 같은 중대 사안은 관련 사건을 감사(위원회)에 보고할 수
                있다.
              </li>
              <li>
                총무팀장은 사건 종료 후 3일이내에 관련 결과를 신고자에게
                고지한다.
              </li>
              <li>
                처벌, 포상에 대한 기준은 당사 규정(인사관리규정 등)에 의한다.
              </li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제9조(보호장치)</h4>
            <ol className={styles.articleList}>
              <li>
                위반행위 신고자가 불이익이 없도록 보호하여야 하며, 필요한 경우
                포상 등 우대조치를 할 수 있다.
              </li>
              <li>
                제보자에 대해 그 사실을 이유로 보복 행위를 하는 임직원에
                대해서는 인사위원회가 정하는 범위 내에서 가중 처벌을 할 수 있다.
              </li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제10조(비위 사건 종결)</h4>
            <ol className={styles.articleList}>
              <li>
                비위 사건에 대한 인사위원회 또는 감사(위원회)의 최종 판결 시
              </li>
              <li>
                신고자에게 추가 서류 또는 비위 사건에 대한 추가 보완을
                요청하였으나, 2회이상 기한 내 보완하지 않거나 무응답 시
              </li>
              <li>동일한 사건에 대하여 이중으로 신고한 경우</li>
              <li>신고 내용이 명백히 거짓인 경우</li>
              <li>
                그밖에 총무팀장 또는 인사위원회에서 더 이상 사건 진행이 필요
                없다 판단하는 경우
              </li>
              <li>단, 상기 2~5항의 경우 신고자의 동의를 얻어야 한다.</li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>
              제11조(윤리경영 자율진단 평가)
            </h4>
            <ol className={styles.articleList}>
              <li>
                매년 1회 회사의 윤리경영에 대한 자율진단을 실시하여
                감사(위원회)의 요청이 있을 경우 보고하여야 한다. (별표4 참조)
              </li>
              <li>
                영업본부, 구매본부는 외부 관계자(대리점, 지점, 납품업체 등
                협력사)의 윤리 경영 실태를 평가하고, 이를 근거로 업체 평가를 할
                수 있다.
              </li>
            </ol>
          </div>

          <div className={styles.article}>
            <h4 className={styles.articleTitle}>제12조(윤리실천지침)</h4>
            <ol className={styles.articleList}>
              <li>
                담당 조직은 임직원들이 윤리규정을 보다 철저히 실천할 수 있도록
                임직원들이 준수해야 할 구체적인 내용은 윤리실천지침을 참고한다.
                (별표 1참조)
              </li>
              <li>
                구매본부 및 영업본부는 별표 1(윤리실천지침) 및
                별표2(대외공문서)를 이해관계자(공급.납품업체)에게 발송하여
                이행에 따른 준수 확인서인 별표 2(실천서약서)를 회신 받아
                보관한다.
              </li>
              <li>
                각 평가 항목별 평가 책임 부서는 별표4의 15조 3항을 참고한다.
              </li>
            </ol>
          </div>
        </section>

        {/* 부칙 */}
        <section className={styles.chapter}>
          <h3 className={styles.chapterTitle}>부칙</h3>
          <ol className={styles.articleList}>
            <li>본 규정은 2005년 01월 25일 부로 제정 시행한다.</li>
            <li>본 규정은 2007년 03월 01일 부로 개정 시행한다.</li>
            <li>본 규정은 2020년 07월 01일 부로 개정 시행한다.</li>
            <li>본 규정은 2021년 04월 01일 부로 개정 시행한다.</li>
          </ol>
        </section>

        {/* [별표1] 에스피지 윤리실천지침 */}
        <section className={styles.chapter}>
          <h3 className={styles.chapterTitle}>[별표1] 에스피지 윤리실천지침</h3>
          <p className={styles.introText}>
            본 지침에서는 윤리규정 및 처벌규정에 대하여 규정하고, 그 실천을
            다짐하는 실천 서약서를 첨부하여 이해관계자(공급/납품업체)의 동참을
            적극 유도한다.
          </p>

          {/* 제1장 총칙 */}
          <div className={styles.subChapter}>
            <h4 className={styles.subChapterTitle}>제1장 총칙</h4>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제1조(적용대상)</h4>
              <ol className={styles.articleList}>
                <li>
                  에스피지와 에스피지가 투자한 법인 및 그 계열사 중 에스피지가
                  경영권을 행사하는 회사 (이하, 계열사)의 임직원은 윤리규정,
                  윤리실천지침(이하 &quot;윤리규&quot;)을 숙지하고 준수한다.
                </li>
                <li>
                  에스피지가 경영권을 행사하는 해외법인의 경우에는 현지법규를
                  함께 고려하여 시행한다.
                </li>
                <li>
                  에스피지가 거래하는 독립된 제3자(고객사, 공급업체, 컨설턴트,
                  대리인, 중개인 등)에게도 해당되는 내용을 이해시키고 적극적인
                  동참을 권유한다.
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제2조(윤리규범의 활용)</h4>
              <ol className={styles.articleList}>
                <li>
                  윤리규범의 준수를 위해 기존 업무 규정 및 절차의 관련 내용을
                  보완하고 필요한 규정을 재정한다.
                </li>
                <li>
                  윤리규범을 업무에 적용할 때 문제가 발생하거나 해석상 기준이
                  명확하지 않을 경우 소속임원과 협의하고, 중요사안은 총무팀에
                  유권해석을 요청한다.
                </li>
                <li>
                  본인 또는 타인이 윤리규범을 위반하였거나 위반할 것을 강요받는
                  경우 총무팀에 신속히 보고한다.
                </li>
                <li>연 1회 윤리규범 실태조사를 실시하고 그 결과를 보존한다.</li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제3조(규제 대상)</h4>
              <ol className={styles.articleList}>
                <li>
                  윤리규범을 위반하거나 다른 사람에게 위반하도록 가용하는 경우
                </li>
                <li>
                  본인 또는 타인의 윤리규범 위반사항을 보고한 임직원에 대해
                  불이익을 주는 경우
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제4조(규제 대상에 대한 조치)
              </h4>
              <ol className={styles.articleList}>
                <li>
                  윤리규범을 위반하거나 다른 사람에게 위반하도록 강요하는 등의
                  규제 대상에 대한 정보는 비정기적인 업무 감사(필요 시) 또는
                  내/외부의 제보로써 취득한다.
                </li>
                <li>
                  취득한 정보는 총무팀 및 인사위원회에서 최소한의 인원만 그
                  정보를 취급하며, 개인적이거나 이해관계 등의 이유로 외부로
                  노출할 수 없다.
                </li>
                <li>
                  규제 대상에 대한 정보는 그 진위를 가리는데 우선하며, 진위를
                  정확히 확인한 후에 다음 조치를 취한다.
                </li>
                <li>
                  규제 대상자에 대한 조치는 외부 의뢰, 인사위원회 회부
                  인사관리규정 등 내부 규정 절차에 의해 처리한다.
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제5조(법규 준수자 보호 장치 구축)
              </h4>
              <ol className={styles.articleList}>
                <li>제보자의 개인 사생활이나 인격의 보호를 최우선으로 한다.</li>
                <li>
                  제보의 내용이 허위이더라도 개인 감정에 의한 허위제보가 아닌
                  경우에는 제보자의 신상에 대한 비밀유지나 인사상의 불이익이
                  없도록 한다.
                </li>
              </ol>
            </div>
          </div>

          {/* 제2장 행동 준칙 */}
          <div className={styles.subChapter}>
            <h4 className={styles.subChapterTitle}>제2장 행동 준칙</h4>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제6조(윤리실천과 준법)</h4>
              <p className={styles.articleContent}>
                글로벌 기업으로서 기본에 철저하고 원칙을 지키는 경영 활동을 통해
                법과 윤리를 준수함으로써 윤리적 기업문화를 정착한다.
              </p>
              <ol className={styles.articleList}>
                <li>
                  <strong>금품</strong>
                  <ol className={styles.subList}>
                    <li>
                      금품은 금전(현금, 상품권, 이용권 등), 물품 등 경제적
                      이익을 가져올 수 있는 것을 뜻한다.
                    </li>
                    <li>
                      어떠한 명목으로도 이해관계자에게 금품을 제공하거나 요구
                      또는 받아서는 안 된다. 다만, 다음에 해당하는 경우는 예외로
                      한다.
                      <ol className={styles.subList}>
                        <li>
                          5만원을 초과하지 않는 이해관계자의 회사 로고가 표시된
                          기념품 및 이해관계자가 주관하는 행사에서 참석자에게
                          일반적으로 제공되는 기념품
                        </li>
                        <li>
                          5만원을 초과하지 않는 판촉 또는 홍보용도의 선물
                          <br />
                          단, 재료의 50%이상이 농축수산물(화훼포함)인 가공품에
                          한하여 10만원까지 허용
                        </li>
                      </ol>
                    </li>
                    <li>
                      인지하지 못한 상태에서 불가피하게 금품을 받은 경우에는
                      반환하여야 하며 반환이 곤란한 경우에는 총무팀에 신고하여야
                      한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>접대</strong>
                  <ol className={styles.subList}>
                    <li>
                      접대는 식사, 술자리, 골프, 공연, 오락 등 비즈니스로 인한
                      인적 모임과 교류를 위해 이루어지는 다양한 활동을 뜻한다.
                    </li>
                    <li>
                      이해관계자와 인당 3만원을 초과하는 접대는 주고 받을 수
                      없다. 다만 업무와 관련하여 인당 3만원을 초과하는 접대를
                      주고 받아야 하는 경우에는 사전에 부서장의 승인을 받아야
                      한다. 불가피하게 3만원을 초과하는 접대를 주고 받은
                      경우에는 총무팀에 신고해야 한다.
                    </li>
                    <li>유흥 시설에서의 접대는 금지한다.</li>
                  </ol>
                </li>
                <li>
                  <strong>편의</strong>
                  <ol className={styles.subList}>
                    <li>
                      편의는 교통수단, 숙박시설, 관광, 행사지원 등의 수혜를
                      제공하거나 받는 것을 뜻한다.
                    </li>
                    <li>
                      통상적 수준을 초과하는 교통수단, 숙박시설 등의 편의를 주고
                      받아서는 안 된다. 다만, 행사 등에서 모든 참석자에게
                      일반적으로 제공되는 편의는 제외한다.
                    </li>
                    <li>
                      불가피하게 허용된 범위를 초과하는 편의를 주고 받은
                      경우에는 총무팀에 신고한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>경조금</strong>
                  <ol className={styles.subList}>
                    <li>
                      본인 또는 동료에게 발생한 경조사를 이해관계자에게 알려서는
                      안되며, 제3자를 통해 알리는 것도 본인의 통지행위로
                      간주한다.
                    </li>
                    <li>
                      직원간 경조사 안내는 사내 인트라넷을 이용하며, 경조사
                      안내의 범위는 직원 본인 및 배우자의 조부모, 부모, 자녀로
                      제한한다.
                    </li>
                    <li>
                      임직원간 경조금은 사회관례상 통상적 수준인 5만원 이하를
                      권장한다.
                    </li>
                    <li>
                      외부 이해관계자에게 경조금을 제공하는 경우엔 화환·조화를
                      포함해 10만원을 한도로 한다. 단, 청탁금지법 적용대상자에
                      대해서는 화환·조화를 제외한 경조금이 5만원을 초과할 수
                      없다.
                    </li>
                    <li>
                      외부 이해관계자로부터는 어떠한 경우에도 경조금을 받지
                      않으며, 불가피하게 경조화환을 받은 경우 전시해서는 안
                      된다.
                    </li>
                    <li>
                      임직원은 특급호텔 등에서의 사치성 혼례를 하지 않도록 한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>청탁/추천</strong>
                  <ol className={styles.subList}>
                    <li>
                      사내 지인 또는 외부인을 통해 다음 사항에 대한 청탁/추천을
                      하지 않는다.
                      <ol className={styles.subList}>
                        <li>설비/자재 구매 및 각종계약에 대한 특혜 요청</li>
                        <li>
                          채용, 승진, 상벌, 보직이동 등 각종 인사에 있어서 우대
                          및 특혜 요청
                        </li>
                        <li>
                          통상적인 절차를 벗어난 과도한 편의, 특혜 제공 등 우대
                          요청
                        </li>
                        <li>
                          점검 및 검수 등 관리, 감독 업무를 소홀히 하도록 요청
                        </li>
                      </ol>
                    </li>
                    <li>
                      청탁금지법에 열거된 대상 직무와 관련하여 직접 또는 제3자를
                      통하여 부정청탁을 해서는 안 된다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>금전거래</strong>
                  <ol className={styles.subList}>
                    <li>
                      이해관계자와 금전대차, 대출보증, 부동산 임대차 등
                      금전거래를 해서는 안 된다.
                    </li>
                    <li>
                      사적인 친분관계로 이해관계자와 불가피하게 금전거래를 한
                      경우에는 총무팀에 신고하여야 한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>행사찬조</strong>
                  <ol className={styles.subList}>
                    <li>
                      부서단위 행사 또는 동호인 활동 등 회사가 지원하는 행사 시
                      이해관계자로부터 찬조금품을 받아서는 안 된다.
                    </li>
                    <li>
                      행사에 필요한 차량, 장소, 용역 등 편의를 제공받은 것도
                      찬조금품을 받은 것으로 간주한다.
                    </li>
                    <li>
                      불가피하게 행사찬조를 받은 경우에는 총무팀에 신고하여야
                      한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>예산재원의 부당한 사용</strong>
                  <ol className={styles.subList}>
                    <li>
                      회의비, 업무추진비 등 회사의 예산재원을 사적인 용도로
                      사용해서는 안 된다.
                    </li>
                    <li>
                      경비 집행 시 법인카드 사용을 원칙으로 하며, 예산의 목적과
                      법이 정하는 기준에 맞게 사용하여야 한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>정보 및 자산의 보호</strong>
                  <ol className={styles.subList}>
                    <li>
                      회사의 비공개 정보나 중요한 정보를 철저히 보호하여야 한다.
                    </li>
                    <li>
                      중요한 정보는 인지하는 즉시 업무에 필요한 사람에게
                      전달한다.
                    </li>
                    <li>정보를 왜곡하거나 허위사실을 유포하지 않는다.</li>
                    <li>
                      회사의 비품, 시설 등을 회사업무와 직접 관련 없는 용도에
                      사용하지 않는다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>공정거래</strong>
                  <ol className={styles.subList}>
                    <li>
                      국제기준 및 국가별 공정거래 관련 법률을 준수함으로써
                      경쟁사와 생산, 가격, 입찰, 시장분할 등에 관한 담합 등
                      불공정거래 행위를 하지 않으며 시장에서 공정하게 경쟁한다.
                    </li>
                    <li>
                      모든 거래는 상호 대등한 위치에서 공정하게 이루어지며 조건
                      및 절차에 대해 사전에 충분한 협의를 거치고, 우월적 지위를
                      남용한 어떠한 부당행위도 하지 않으며, 거래선 선정에
                      특수관계자(임직원의 가족, 친인척, 친구, 학연 및 지연에
                      의한 관계자, 근무경력자 등)를 객관적인 검증절차(입찰,
                      비교견적 등)없이 거래처로 선정하지 않는다.
                    </li>
                    <li>
                      지적재산권을 포함하여 타인의 권리와 재산을 존중하고 이를
                      침해해서 거래나 이득을 취하지 않는다.
                    </li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제7조(임직원의 일과 삶의 조화)
              </h4>
              <p className={styles.articleContent}>
                일과 삶의 균형을 통해 개인의 성장과 회사의 발전을 추구하며 상호
                존중하는 기업문화의 정착을 통해 행복하게 일하는 일터를 조성한다.
              </p>
              <ol className={styles.articleList}>
                <li>
                  <strong>일과 삶의 균형 추구</strong>
                  <ol className={styles.subList}>
                    <li>
                      임직원의 생활여건 안정에 도움이 되는 복리후생 제공 등을
                      통해 삶의 질 향상을 도모한다.
                    </li>
                    <li>
                      임직원이 개인의 비전을 달성하도록 지원하고 시간, 장소,
                      방법 등에서 유연하게 업무를 수행할 수 있도록 한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>교육과 성장의 기회 제공</strong>
                  <ol className={styles.subList}>
                    <li>창의적으로 일할 수 있는 근로환경과 제도를 마련한다.</li>
                    <li>
                      임직원이 능력과 자질을 개발하여 최고의 역량을 지닌 인재가
                      될 수 있도록 역량향상과 자기개발 교육을 지원한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>공정한 평가 및 보상</strong>
                  <ol className={styles.subList}>
                    <li>
                      회사는 임직원 개인의 역량과 성과에 기반한 공정한 평가를
                      실시하고 이를 체계적으로 반영하여 적절한 보상이
                      이루어지도록 한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>건전한 조직문화 조성</strong>
                  <ol className={styles.subList}>
                    <li>
                      임직원은 열린 의사소통을 통해 개방적인 기업문화를
                      지향한다.
                    </li>
                    <li>
                      임직원은 조직간의 벽을 없애고 상호 협력하는 조직 분위기를
                      조성한다.
                    </li>
                    <li>
                      <strong>임직원 보호</strong>
                      <ol className={styles.subList}>
                        <li>
                          개인의 인권을 침해하는 성희롱 행위를 포함하여, 다른
                          사람에게 불쾌감을 주는 언어적, 육체적, 시각적 행동을
                          하지 않는다.
                        </li>
                        <li>
                          임직원 개개인의 사생활을 존중하며 타인에 대한 비방이나
                          음해 등을 하지 않으며, 개인 정보를 유출하지 않는다.
                        </li>
                        <li>
                          정신적·육체적 강요에 의해 비자발적으로 수행되는 업무가
                          발생하지 않도록 한다.
                        </li>
                        <li>
                          미성년자의 노동조건과 최저 노동의 연령기준은 국가별
                          노동법과 국제기준을 준수한다.
                        </li>
                        <li>
                          안전수칙을 철저히 준수하고 발견된 위험요소에 대해서는
                          적절한 조치를 취한다.
                        </li>
                      </ol>
                    </li>
                    <li>
                      <strong>존중과 평등</strong>
                      <ol className={styles.subList}>
                        <li>
                          인종, 국적, 성, 연령, 학벌, 종교, 지역, 장애,
                          결혼여부, 성 정체성 등을 이유로 어떠한 차별이나
                          괴롭힘을 하지 않는다.
                        </li>
                        <li>
                          직무 자격 요건과 능력을 갖추고 있는 경우에는 고용에
                          있어 평등하게 기회를 제공한다.
                        </li>
                        <li>
                          다양한 문화적 차이를 존중하여 근로환경을 유지한다.
                        </li>
                      </ol>
                    </li>
                    <li>
                      <strong>적법하고 인간적인 고용조건 보장</strong>
                      <ol className={styles.subList}>
                        <li>
                          임직원이 제기한 인권문제에 대해서는 회사의 고충처리
                          제도를 이용하여 신속하게 조치한다.
                        </li>
                        <li>
                          인간의 존엄을 유지할 수 있는 생활을 영위할 수 있도록
                          적정한 근로시간 유지 등 고용조건을 보장한다.
                        </li>
                      </ol>
                    </li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제8조(고객가치 창출과 신뢰확보)
              </h4>
              <ol className={styles.articleList}>
                <li>
                  <strong>고객만족 실현</strong>
                  <ol className={styles.subList}>
                    <li>
                      고객의 소리를 경청하고 존중하는 고객 중심의 업무를
                      수행한다.
                    </li>
                    <li>
                      고객의 정당한 요구와 합리적인 제안을 적극적으로 수용한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>고객가치 창출</strong>
                  <ol className={styles.subList}>
                    <li>
                      지속적인 기술개발을 통해 최상의 제품을 제공함으로써 고객의
                      니즈에 부응한다.
                    </li>
                    <li>
                      임직원은 국내외 시장현황을 파악하고 고객의 문화와 관습을
                      존중하는 서비스 마인드를 함양한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>고객신뢰 확보</strong>
                  <ol className={styles.subList}>
                    <li>
                      경영활동에서 고객의 안전과 건강을 충분히 고려하여 고객의
                      안전과 건강에 위협이 되는 제품과 서비스를 제공하지 않는다.
                    </li>
                    <li>
                      고객의 정보를 보호하며 정보보호에 관한 법규와 규정을
                      준수한다.
                    </li>
                    <li>고객에게 정확한 정보를 적기에 제공한다.</li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제9조(투자자에 대한 신의성실의 의무)
              </h4>
              <p className={styles.articleContent}>
                투명한 의사결정과 효율적인 경영활동으로 정당한 이익을
                실현함으로써 투자자 가치를 극대화한다.
              </p>
              <ol className={styles.articleList}>
                <li>
                  <strong>주주가치 증대추구</strong>
                  <ol className={styles.subList}>
                    <li>
                      투명한 의사결정과 효율적인 경영활동을 통해 이익을 창출하고
                      기업가치와 주주의 가치를 동시에 증대한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>투자정보의 공정한 제공</strong>
                  <ol className={styles.subList}>
                    <li>
                      투자자의 투자판단에 영향을 미칠 수 있는 정보를 일부
                      투자자에게만 제공하거나, 내용을 선별하여 제공하지 않는다.
                    </li>
                    <li>
                      직무상 취득한 내부정보를 이용하여 주식이나 유가증권을 직접
                      거래하거나 타인에게 거래를 권유하지 않는다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>투명한 재무정보 산출 및 제공</strong>
                  <ol className={styles.subList}>
                    <li>
                      재무정보는 정확한 거래사실을 기반으로 적절한 프로세스와
                      통제를 통해 산출되어야 한다.
                    </li>
                    <li>
                      일반적으로 인정된 회계기준에 따라 재무보고를 작성한다.
                    </li>
                    <li>
                      투자자들이 자유로운 판단과 책임하에 투자결정을 내릴 수
                      있도록 충분하고 정확한 경영정보를 제공한다.
                    </li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제10조(거래회사와 상생관계 구축)
              </h4>
              <p className={styles.articleContent}>
                상호신뢰를 기반으로 공정한 거래질서를 확립하고 이해관계자와의
                동반성장을 통해 함께 공존하는 기업생태계를 구축한다.
              </p>
              <ol className={styles.articleList}>
                <li>
                  <strong>상호신뢰 구축</strong>
                  <ol className={styles.subList}>
                    <li>
                      거래회사와의 거래가 상호존중과 동등한 관계를 통해 공정하게
                      이루어지도록 한다.
                    </li>
                    <li>
                      거래회사와의 거래에서 입수한 정보를 관련 법규와 계약서상의
                      조건에 따라 엄격히 보호한다.
                    </li>
                    <li>
                      거래회사가 공정거래와 관련된 법규와 규정을 준수하도록
                      지원한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>거래회사와의 동반성장 추진</strong>
                  <ol className={styles.subList}>
                    <li>거래회사와 성과를 공유하여 상호 이익을 추구한다.</li>
                    <li>
                      거래회사와 원활한 의사소통과 상호 협력을 통해 거래회사가
                      우수한 품질의 제품과 수준 높은 서비스를 제공할 수 있도록
                      한다.
                    </li>
                    <li>
                      거래회사에게는 공평한 기회를 제공하고 합리적인 거래조건을
                      보장하여 동반자 관계로 발전시킨다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>거래회사의 지속적 발전지원</strong>
                  <ol className={styles.subList}>
                    <li>
                      거래회사에 대한 기술 지원 등을 통하여 안정적인 공급망이
                      구축되도록 노력한다.
                    </li>
                    <li>
                      기업 생태계의 전체적인 상생을 위해 동반성장 거래회사의
                      범위를 확대시킨다.
                    </li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제11조(국가와 사회에 대한 공헌)
              </h4>
              <p className={styles.articleContent}>
                글로벌 기업시민으로서의 책임과 의무를 다함으로써 국가와
                사회발전에 기여한다.
              </p>
              <ol className={styles.articleList}>
                <li>
                  <strong>기업시민으로서의 역할과 자세</strong>
                  <ol className={styles.subList}>
                    <li>
                      현지국의 법규와 규정, 지역사회의 문화와 전통을 존중하고
                      국가사회와의 공동 발전을 위해 노력한다.
                    </li>
                    <li>
                      국가사회와 관련이 있는 경영활동 과정에서 이해관계자의
                      참여를 통해 의사소통할 수 있도록 노력한다.
                    </li>
                    <li>
                      거래회사가 국가사회 발전을 위한 활동에 참여하도록
                      노력한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>국가와 사회 발전에 기여</strong>
                  <ol className={styles.subList}>
                    <li>
                      회사는 안정적인 일자리 창출과 유지, 성실한 세금 납부를
                      통해 지역사회에서의 의무를 다한다.
                    </li>
                    <li>
                      자원봉사, 재난구호 등 사회봉사활동에 적극 참여하고 문화,
                      예술, 스포츠, 학문 등 각 분야에서의 공익활동을 전개한다.
                    </li>
                    <li>
                      지역주민의 삶의 질을 향상시키고 행복한 삶을 누릴 수 있도록
                      지원한다.
                    </li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제12조(환경보호와 생태계 보전)
              </h4>
              <p className={styles.articleContent}>
                환경경영체계를 구축하고 환경 리스크 대응 역량을 강화하며 열린
                의사소통을 통해 친환경 경영을 수행한다.
              </p>
              <ol className={styles.articleList}>
                <li>
                  <strong>환경경영체계 구축</strong>
                  <ol className={styles.subList}>
                    <li>
                      환경경영체계를 효과적으로 운영하여 환경경영 목표를 달성할
                      수 있도록 기업활동이 환경에 미치는 영향과 리스크를
                      평가하고, 환경경영 실적을 체계적으로 관리 분석한다.
                    </li>
                    <li>
                      다양한 이해관계자와 성과 및 이슈를 공유하고 환경보존
                      활동을 함께 수행한다.
                    </li>
                    <li>
                      거래회사와 환경보호가 기업의 기본적인 사회적 책무임에 대한
                      공감대를 형성하고, 환경보호에 관한 법규와 규정을
                      준수하도록 지원한다.
                    </li>
                    <li>
                      거래회사가 제품의 생산과 서비스의 제공에 있어 공공의
                      보건과 안전을 지키는 한편, 지역사회 환경과 천연자원에
                      미치는 부정적인 효과를 최소화하도록 지원한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>환경법규 준수 및 환경영향 개선</strong>
                  <ol className={styles.subList}>
                    <li>
                      환경법규를 준수하고 제품의 개발과 생산, 사용 등의 전
                      과정에서 환경영향 개선을 위해 노력한다.
                    </li>
                    <li>
                      친환경생산 공정 도입과 환경오염 방지 최적기술 적용으로
                      오염물질 배출을 최소화한다.
                    </li>
                  </ol>
                </li>
                <li>
                  <strong>기후변화 대응</strong>
                  <ol className={styles.subList}>
                    <li>
                      화석연·원료 사용량을 저감하고 에너지 효율 향상을 통해
                      온실가스 배출을 감축하기 위해 노력한다.
                    </li>
                    <li>저탄소 혁신기술 개발을 통해 경쟁력을 강화한다.</li>
                  </ol>
                </li>
              </ol>
            </div>
          </div>

          {/* 제3장 관리와 운영 */}
          <div className={styles.subChapter}>
            <h4 className={styles.subChapterTitle}>제3장 관리와 운영</h4>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제14조(윤리규범의 준수)</h4>
              <ol className={styles.articleList}>
                <li>
                  윤리규범을 행동과 가치판단의 기준으로 삼아 성실히 준수하여야
                  한다.
                </li>
                <li>
                  윤리규범의 제반 관리업무는 총무팀으로 하고, 세부 운영은 분야별
                  책임부서에서 한다.
                </li>
                <li>
                  <strong>책임 부서:</strong> 윤리규범을 실행함에 있어 7개의
                  분야별로 리스크 관리, 보고 및 평가 등의 책임을 지는 부서
                  <ol className={styles.subList}>
                    <li>윤리실천과 준법: 전 부서</li>
                    <li>
                      임직원의 일과 삶의 조화, 국가와 사회에 대한 공헌: 총무팀
                    </li>
                    <li>고객가치 창출과 신뢰확보: 해외/영업본부</li>
                    <li>투자자에 대한 신의성실 의무: 재무팀, 기획(IR담당)</li>
                    <li>거래회사와 상생관계 구축: 구매본부</li>
                    <li>환경보호와 생태계 보전: 품질보증팀</li>
                  </ol>
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제15조(임원 및 부서장의 책임)
              </h4>
              <ol className={styles.articleList}>
                <li>
                  임원 및 부서장은 소속 직원이 이 규범을 충분히 이해할 수 있도록
                  교육과 상담을 수시로 실시하여야 한다.
                </li>
                <li>
                  임원 및 부서장은 소속직원이 이 규범을 위반하지 않도록 적절한
                  예방조치를 취하여야 한다.
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>
                제16조(신고의무 및 비밀 보장)
              </h4>
              <ol className={styles.articleList}>
                <li>
                  윤리규범을 위반한 사실을 알게 된 경우 가장 신속하고 편리한
                  방법으로 총무팀에 신고하여야 한다.
                </li>
                <li>
                  임원 및 부서장은 소속직원이 윤리규범을 위반한 사실을 보고받는
                  즉시 총무팀에 신고하여야 한다.
                </li>
                <li>
                  총무팀은 신고 받은 사안에 대해 필요 시 사실확인을 할 수
                  있으며, 관련 임직원은 이에 적극 협조하여야 한다.
                </li>
                <li>
                  임직원은 보고자 및 신고자에게 불이익을 가하거나 그 신분을
                  누설하여서는 안 된다.
                </li>
                <li>
                  보고자 및 신고자가 인사상 불이익을 받을 우려가 있는 경우에는
                  본인의 희망에 따라 보직변경 등 인사조치를 취한다.
                </li>
                <li>
                  임직원은 직무상 또는 우연히 신고사실을 알았더라도 그 비밀을
                  지켜야 하며, 누설한 경우 징계를 받을 수 있다.
                </li>
                <li>
                  이해관계자로부터의 금품수수 등에 대한 비윤리 행위 신고 및
                  보상에 대한 운영기준은 인사관리규정에 의한다.
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제17조(포상 및 징계)</h4>
              <ol className={styles.articleList}>
                <li>
                  회사는 윤리규범의 목적을 달성하는 데 공로가 있는 임직원에게
                  관련 규정에 따라 포상 또는 적정한 보상금을 지급할 수 있다.
                </li>
                <li>
                  회사는 윤리규범을 위반한 임직원에 대해 관련규정에 따라 엄중
                  문책한다.
                </li>
                <li>
                  회사는 윤리규범을 위반하여 퇴직한 임직원에 대하여 회사출입 및
                  거래를 제한할 수 있다.
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제18조(인사위원회 운영)</h4>
              <ol className={styles.articleList}>
                <li>
                  회사는 윤리관련 중요 안건의 보고, 심의, 의결은 인사위원회에서
                  한다.
                </li>
              </ol>
            </div>

            <div className={styles.article}>
              <h4 className={styles.articleTitle}>제19조(기타)</h4>
              <ol className={styles.articleList}>
                <li>
                  임직원의 명의를 이용하여 그 가족, 친인척, 지인 등이 이
                  윤리규범을 위반하는 행위도 본인의 행위로 간주한다.
                </li>
                <li>
                  윤리규범에서 구체적으로 정하지 않은 부분이 있거나 해석에
                  분쟁이 있는 경우 총무팀에 문의하여 그 해석에 따른다.
                </li>
              </ol>
            </div>
          </div>

          <div className={styles.revisionDate}>개정일자 2005. 04. 01</div>
        </section>
      </div>
    </div>
  );
}
