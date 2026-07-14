import ProductionCategoryHub from "@/modules/production/components/ProductionCategoryHub";
import styles from "@/modules/production/components/ProductionComponents.module.css";

export default function Page() {
  return (
    <div className={`${styles.container} ${styles.centeredHub}`}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title} style={{ fontSize: "1.85rem" }}>Choose Production Category</h1>
        <p className={styles.subtitle}>Select a department to view and manage active production jobs.</p>
      </div>
      <ProductionCategoryHub />
    </div>
  );
}