import { useCallback, useState } from "react";
import type { Place } from "../types";
import { describeLocationFailure, getMyPlace } from "../utils/geolocation";
import Button from "./Button";
import Modal from "./Modal";
import PinIcon from "./PinIcon";
import styles from "./LocationPrompt.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onFound: (place: Place) => void;
};

const POINTS = [
  "Only used to show the weather where you are.",
  "Rounded to about 1 km and kept on this device. It is sent to the weather service (Open-Meteo) to get your forecast.",
  "You can turn it off any time in your browser settings.",
];

export default function LocationPrompt({ isOpen, onClose, onFound }: Props) {
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = useCallback(() => {
    setMessage("");
    onClose();
  }, [onClose]);

  const handleAllow = async () => {
    setIsLocating(true);
    setMessage("");
    try {
      const place = await getMyPlace(); // the browser asks for permission here
      onFound(place);
    } catch (error) {
      setMessage(describeLocationFailure(error));
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <Modal title="Use your location?" isOpen={isOpen} onClose={handleClose}>
      <div className={styles.disc}>
        <PinIcon size={36} />
      </div>
      <p className={styles.intro}>
        Allow Weather to find where you are, so we can show your local forecast.
      </p>
      <ul className={styles.points}>
        {POINTS.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      {message !== "" && (
        <p className={styles.error} role="alert">
          {message}
        </p>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleClose}>
          {message !== "" ? "Close" : "Not now"}
        </Button>
        <Button onClick={handleAllow} isLoading={isLocating}>
          {isLocating ? "Finding your location" : "Allow location"}
        </Button>
      </div>
      <p className={styles.footnote}>Your browser will ask for permission next.</p>
    </Modal>
  );
}