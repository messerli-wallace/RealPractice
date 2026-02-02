import Image from "next/image";
import loader from "../assets/catusjksk.gif";
import styles from "./LoadingGif.module.css";

const LoadingImage = () => {
  return (
    <div className={styles.loadingContainer}>
      <Image src={loader} alt="loading..." />
    </div>
  );
};

export default LoadingImage;
