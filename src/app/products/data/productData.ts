// 제품 데이터 타입 정의
export interface ProductFeature {
  korean: string;
  english: string;
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  detailUrl: string;
  description?: string;
  descriptionEn?: string;
  features?: ProductFeature[];
  catalogPdfUrl?: string;
  technicalPdfUrl?: string;
  content?: string;
}

export interface ProductSubCategory {
  id: string;
  label: string;
  title?: {
    korean: string;
    english: string;
  };
  products: Product[];
}

export interface ProductCategory {
  id: string;
  tabValue: number;
  label: string;
  title: {
    korean: string;
    english: string;
  };
  subCategories: ProductSubCategory[];
}

const standardAcProducts: ProductSubCategory[] = [
  {
    id: "standard-ac",
    label: "STANDARD AC",
    title: { korean: "표준 AC 기어드모터", english: "STANDARD AC MOTOR" },
    products: [
      {
        id: "product-1",
        name: "컴퍼넌트 컵형",
        nameEn: "Component Cup Type",
        image: "/images/products/prd_01.png",
        detailUrl: "/products/product-1",
        description:
          "Component Cup Type은 컴팩트한 구조에 고토크, 고강성, 제로 백래쉬를 구현한 고정밀 감속기입니다. 정밀 위치 제어와 부드러운 회전이 요구되는 로봇 및 자동화 장비에 최적화 된 솔루션입니다.",
        features: [
          {
            korean: "컴팩트 심플한 디자인",
            english: "Compact and simple design",
          },
          { korean: "제로백래쉬", english: "Non-backlash" },
          { korean: "고토크용량", english: "High torque capacity" },
          {
            korean: "우수한 위치결정정도와 최견정도",
            english: "High positioning and rotational accuracies",
          },
          { korean: "고강성", english: "High stiffness" },
          { korean: "입출력측이 동축", english: "Coaxial input and output" },
        ],
        catalogPdfUrl: "#",
        technicalPdfUrl: "#",
        content: "제품 상세 내용이 여기에 표시됩니다.",
      },
      {
        id: "product-2",
        name: "유니트 컵형",
        nameEn: "Unit Cup Type",
        image: "/images/products/prd_02.png",
        detailUrl: "/products/product-2",
        description: "Unit Cup Type 제품 설명입니다.",
        features: [
          {
            korean: "컴팩트 심플한 디자인",
            english: "Compact and simple design",
          },
          { korean: "고토크용량", english: "High torque capacity" },
        ],
        catalogPdfUrl: "#",
        technicalPdfUrl: "#",
        content: "제품 상세 내용이 여기에 표시됩니다.",
      },
      {
        id: "product-3",
        name: "컴퍼넌트 실크햇형",
        nameEn: "Component Cup Type",
        image: "/images/products/prd_03.png",
        detailUrl: "/products/product-3",
      },
      {
        id: "product-4",
        name: "간이유니트 실크햇형",
        nameEn: "Simple Unit Silk Hat Type",
        image: "/images/products/prd_04.png",
        detailUrl: "/products/product-4",
      },
      {
        id: "product-5",
        name: "유니트 실크햇 중공형",
        nameEn: "Unit Silk Hat Hollow Shaft Type",
        image: "/images/products/prd_05.png",
        detailUrl: "/products/product-5",
      },
      {
        id: "product-6",
        name: "유니크 실크햇 입력축형",
        nameEn: "Unit Silk Hat Input Shaft Type",
        image: "/images/products/prd_06.png",
        detailUrl: "/products/product-6",
      },
      {
        id: "product-7",
        name: "제품 7",
        nameEn: "Product 7",
        image: "/images/products/prd_01.png",
        detailUrl: "/products/product-7",
      },
      {
        id: "product-8",
        name: "제품 8",
        nameEn: "Product 8",
        image: "/images/products/prd_02.png",
        detailUrl: "/products/product-8",
      },
      {
        id: "product-9",
        name: "제품 9",
        nameEn: "Product 9",
        image: "/images/products/prd_03.png",
        detailUrl: "/products/product-9",
      },
      {
        id: "product-10",
        name: "제품 10",
        nameEn: "Product 10",
        image: "/images/products/prd_04.png",
        detailUrl: "/products/product-10",
      },
      {
        id: "product-11",
        name: "제품 11",
        nameEn: "Product 11",
        image: "/images/products/prd_05.png",
        detailUrl: "/products/product-11",
      },
      {
        id: "product-12",
        name: "제품 12",
        nameEn: "Product 12",
        image: "/images/products/prd_06.png",
        detailUrl: "/products/product-12",
      },
    ],
  },
  {
    id: "industrial-ac",
    label: "INDUSTRIAL AC",
    title: { korean: "산업용 AC 기어드모터", english: "INDUSTRIAL AC MOTOR" },
    products: [
      {
        id: "product-9-industrial-ac",
        name: "인더스트리얼 AC 1",
        nameEn: "Industrial AC 1",
        image: "/images/products/prd_03.png",
        detailUrl: "/products/product-9-industrial-ac",
      },
    ],
  },
  {
    id: "condenser-run",
    label: "CONDENSER RUN GEARED MOTOR",
    title: {
      korean: "콘덴서 런 기어드모터",
      english: "CONDENSER RUN GEARED MOTOR",
    },
    products: [
      {
        id: "product-10-condenser-run",
        name: "콘덴서 런 기어드 모터 1",
        nameEn: "Condenser Run Geared Motor 1",
        image: "/images/products/prd_04.png",
        detailUrl: "/products/product-10-condenser-run",
      },
    ],
  },
  {
    id: "shaded-pole",
    label: "SHADED POLE GEARED MOTOR",
    title: {
      korean: "셰이드 폴 기어드모터",
      english: "SHADED POLE GEARED MOTOR",
    },
    products: [
      {
        id: "product-11-shaded-pole",
        name: "셰이드 폴 기어드 모터 1",
        nameEn: "Shaded Pole Geared Motor 1",
        image: "/images/products/prd_05.png",
        detailUrl: "/products/product-11-shaded-pole",
      },
    ],
  },
  {
    id: "fan-ac",
    label: "FAN AC",
    title: { korean: "팬 AC 모터", english: "FAN AC MOTOR" },
    products: [
      {
        id: "product-12-fan-ac",
        name: "팬 AC 1",
        nameEn: "Fan AC 1",
        image: "/images/products/prd_06.png",
        detailUrl: "/products/product-12-fan-ac",
      },
    ],
  },
];

export const productCategories: ProductCategory[] = [
  {
    id: "standard-ac-geared-motor",
    tabValue: 0,
    label: "표준 AC 기어드모터",
    title: {
      korean: "표준 AC 기어드모터",
      english: "STANDARD AC GEARED MOTOR",
    },
    subCategories: standardAcProducts,
  },
  {
    id: "sh-precision-reducer",
    tabValue: 1,
    label: "SH 정밀감속기",
    title: { korean: "SH 정밀감속기", english: "PRECISION REDUCER" },
    subCategories: [],
  },
  {
    id: "sr-precision-reducer",
    tabValue: 2,
    label: "SR 정밀감속기",
    title: { korean: "SR 정밀감속기", english: "LOW BACKLASH REDUCER" },
    subCategories: [],
  },
  {
    id: "planetary-gearheads",
    tabValue: 3,
    label: "서보모터용 정밀 유성감속기",
    title: {
      korean: "서보모터용 정밀 유성감속기",
      english: "PLANETARY GEARHEADS",
    },
    subCategories: [],
  },
  {
    id: "industrial-motor",
    tabValue: 4,
    label: "동력용 모터",
    title: { korean: "동력용 모터", english: "INDUSTRIAL MOTOR" },
    subCategories: [],
  },
  {
    id: "industrial-geared-motor",
    tabValue: 5,
    label: "동력용 기어드 모터",
    title: {
      korean: "동력용 기어드 모터",
      english: "INDUSTRIAL GEARED MOTOR - MEGA Series",
    },
    subCategories: [],
  },
  {
    id: "bldc-geared-motor",
    tabValue: 6,
    label: "BLDC 기어드 모터 X-TOR",
    title: {
      korean: "BLDC 기어드 모터 X-TOR",
      english: "BLDC GEARED MOTOR X-TOR",
    },
    subCategories: [],
  },
  {
    id: "dc-geared-motor",
    tabValue: 7,
    label: "DC 기어드 모터",
    title: { korean: "DC 기어드 모터", english: "DC GEARED MOTOR" },
    subCategories: [],
  },
  {
    id: "sg-standard-ac-geared-motor",
    tabValue: 8,
    label: "SG 표준 AC 기어드모터",
    title: {
      korean: "SG 표준 AC 기어드모터",
      english: "SG STANDARD AC GEARED MOTOR",
    },
    subCategories: [],
  },
  {
    id: "hollow-rotary-table",
    tabValue: 9,
    label: "로타리 테이블",
    title: { korean: "로타리 테이블", english: "HOLLOW ROTARY TABLE" },
    subCategories: [],
  },
  {
    id: "industrial-worm-reducer",
    tabValue: 10,
    label: "동력용 웜 감속기",
    title: { korean: "동력용 웜 감속기", english: "INDUSTRIAL WORM REDUCER" },
    subCategories: [],
  },
  {
    id: "bevel-gearbox",
    tabValue: 11,
    label: "베벨 기어박스",
    title: { korean: "베벨 기어박스", english: "BEVEL GEARBOX" },
    subCategories: [],
  },
  {
    id: "step-motor",
    tabValue: 12,
    label: "스텝모터",
    title: { korean: "스텝모터", english: "STEP MOTOR" },
    subCategories: [],
  },
];

export const productTabs = productCategories.map(({ label, tabValue }) => ({
  label,
  value: tabValue,
}));

export const productData: Record<string, Product[]> = Object.fromEntries(
  productCategories.flatMap((category) =>
    category.subCategories.map((subCategory) => [
      subCategory.id,
      subCategory.products,
    ])
  )
);

export function getMainCategoryByTab(
  tabValue: number
): ProductCategory | undefined {
  return productCategories.find((category) => category.tabValue === tabValue);
}

export function getDefaultSubCategoryId(tabValue: number): string {
  return getMainCategoryByTab(tabValue)?.subCategories[0]?.id ?? "";
}

export function getSubCategoryById(id: string): ProductSubCategory | undefined {
  return productCategories
    .flatMap((category) => category.subCategories)
    .find((subCategory) => subCategory.id === id);
}

export function getProductById(id: string): Product | undefined {
  return productCategories
    .flatMap((category) => category.subCategories)
    .flatMap((subCategory) => subCategory.products)
    .find((product) => product.id === id);
}

export function getAllProducts(): Product[] {
  return productCategories.flatMap((category) =>
    category.subCategories.flatMap((subCategory) => subCategory.products)
  );
}
