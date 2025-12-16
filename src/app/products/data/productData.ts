// 제품 데이터 타입 정의
export interface Product {
  id: string;
  name: string;
  nameEn: string;
  image: string;
  detailUrl: string;
  description?: string;
  features?: Array<{ korean: string; english: string }>;
  catalogPdfUrl?: string;
  technicalPdfUrl?: string;
  content?: string;
}

// 제품 데이터
export const productData: Record<string, Product[]> = {
  "standard-ac": [
    {
      id: "product-1",
      name: "컴퍼넌트 컵형",
      nameEn: "Component Cup Type",
      image: "/images/products/prd_01.png",
      detailUrl: "/products/product-1",
      description:
        "Component Cup Type은 컴팩트한 구조 고토크 고강성, 제로백래쉬를 구현한 고정밀 감속기입니다. 정밀 위치 제어와 부드러운 회전이 요구되는 로봇 및 자동화 장비에 최적화된 솔루션입니다.",
      features: [
        { korean: "컴팩트 심플한 디자인", english: "Compact and simple design" },
        { korean: "고토크용량", english: "High torque capacity" },
        { korean: "고강성", english: "High stiffness" },
        { korean: "제로백래쉬", english: "Non-backlash" },
        {
          korean: "우수한 위치결정정도와 최견정도",
          english: "High positioning and rotation accuracies",
        },
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
        { korean: "컴팩트 심플한 디자인", english: "Compact and simple design" },
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
  "industrial-ac": [
    {
      id: "product-9",
      name: "인더스트리얼 AC 1",
      nameEn: "Industrial AC 1",
      image: "/images/products/prd_03.png",
      detailUrl: "/products/product-9",
    },
  ],
  "condenser-run": [
    {
      id: "product-10",
      name: "콘덴서 런 기어드 모터 1",
      nameEn: "Condenser Run Geared Motor 1",
      image: "/images/products/prd_04.png",
      detailUrl: "/products/product-10",
    },
  ],
  "shaded-pole": [
    {
      id: "product-11",
      name: "셰이드 폴 기어드 모터 1",
      nameEn: "Shaded Pole Geared Motor 1",
      image: "/images/products/prd_05.png",
      detailUrl: "/products/product-11",
    },
  ],
  "fan-ac": [
    {
      id: "product-12",
      name: "팬 AC 1",
      nameEn: "Fan AC 1",
      image: "/images/products/prd_06.png",
      detailUrl: "/products/product-12",
    },
  ],
};

// 모든 제품을 ID로 찾는 헬퍼 함수
export function getProductById(id: string): Product | undefined {
  for (const category in productData) {
    const product = productData[category].find((p) => p.id === id);
    if (product) return product;
  }
  return undefined;
}

// 모든 제품 목록 가져오기
export function getAllProducts(): Product[] {
  const allProducts: Product[] = [];
  for (const category in productData) {
    allProducts.push(...productData[category]);
  }
  return allProducts;
}

