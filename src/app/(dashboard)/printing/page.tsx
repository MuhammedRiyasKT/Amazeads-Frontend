// src/app/(dashboard)/printing/page.tsx

import PrintingCategoryHub from "@/modules/printing/components/PrintingCategoryHub";
import styles from "@/modules/printing/components/PrintingComponents.module.css";

export default function Page() {
  return (
    // ഇവിടെ 'styles.container'-നോടൊപ്പം 'styles.centeredHub' കൂടി ചേർക്കുന്നു (പ്രധാന തിരുത്ത്!)
    <div className={`${styles.container} ${styles.centeredHub}`}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title} style={{ fontSize: "1.85rem" }}>Choose Printing Category</h1>
        <p className={styles.subtitle}>Select a department to view and manage active production jobs.</p>
      </div>
      <PrintingCategoryHub />
    </div>
  );
}