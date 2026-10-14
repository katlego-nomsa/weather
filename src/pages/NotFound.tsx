import Button from "../components/Button";
import Navbar from "../components/Navbar";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className={styles.wrap}>
        <section className={styles.card}>
          <p className={styles.code} aria-hidden="true">
            404
          </p>
          <h1>This page does not exist</h1>
          <p className={styles.message}>The link may be broken, or the page may have moved.</p>
          <Button to="/">Back to weather</Button>
        </section>
      </main>
    </>
  );
}