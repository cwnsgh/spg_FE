/**
 * 단일 제품 카드 링크. 현재 저장소에서 import되지 않음(`ProductGrid`가 자체 카드 마크업 사용).
 */
import Link from "next/link";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  id: string;
  koreanTitle: string;
  englishTitle: string;
  imageUrl?: string;
}

export default function ProductCard({
  id,
  koreanTitle,
  englishTitle,
  imageUrl,
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={koreanTitle} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>이미지</div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.koreanTitle}>{koreanTitle}</h3>
        <p className={styles.englishTitle}>{englishTitle}</p>
      </div>
      <div className={styles.viewIcon}>→</div>
    </Link>
  );
}
