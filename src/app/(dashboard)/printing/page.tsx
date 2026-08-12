import PrintingCategoryHub from "@/modules/printing/components/PrintingCategoryHub";
import styles from "@/modules/printing/components/PrintingComponents.module.css";

export default function Page() {
  return (
    <div className={`${styles.container} ${styles.centeredHub}`}>
      <div className={styles.titleBlock}>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Choose Printing Category
        </h1>
        <p className={styles.subtitle}>
          Select a department to view and manage active production jobs.
        </p>
      </div>
      <PrintingCategoryHub />
    </div>
  );
}