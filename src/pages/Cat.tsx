import { Nav } from "../components/common";
import { TPrediction } from "../types";
import { InferenceEngine, CVImage } from "inferencejs";
import { useEffect, useState, useMemo, useRef } from "react";

const catLinks = [
  { url: "/", label: "Home" },
  { url: "/upload", label: "Upload" },
  { url: "/webcam", label: "Webcam" },
];

export default function Cat() {
  const inferEngine = useMemo(() => {
    return new InferenceEngine();
  }, []);

  const [isWebcam, setIsWebcam] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean | null>(false);
  const [workerId, setWorkerId] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetWidth = 640;
  const targetHeight = 480;

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const workerId = await inferEngine.startWorker(
          "cat-detector-jkr5g",
          3,
          "rf_wh6tztcZJKhY76kCVf0naEsLG3E2"
        );

        setWorkerId(workerId);

        setIsLoading(false);
      } catch (err) {
        console.error(err);

        setIsLoading(null);
      }
    })();
  }, [inferEngine]);

  useEffect(() => {
    if (isLoading || isLoading === null || !isWebcam) {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      }

      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }

      return;
    }

    (async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: targetWidth },
          height: { ideal: targetHeight },
          facingMode: "environment",
        },
      });

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };

      videoRef.current.onplay = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;

        videoRef.current.width = width;
        videoRef.current.height = height;

        canvasRef.current.width = width;
        canvasRef.current.height = height;

        await detectFrame();
      };

      const detectFrame = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const cvimg = new CVImage(videoRef.current);

        const predictions = (await inferEngine.infer(
          workerId,
          cvimg
        )) as TPrediction[];

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach((prediction) => {
          const { x, y, width, height } = prediction.bbox;

          const lineWidth = 2;
          const scaledX = x - width / 2;
          const scaledY = y - height / 2;
          const text = `${prediction.class} ${Math.round(prediction.confidence * 100)}%`;
          const textWidth = ctx.measureText(text).width;

          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = prediction.color;
          ctx.strokeRect(scaledX, scaledY, width, height);

          ctx.fillStyle = prediction.color;
          ctx.fillRect(
            scaledX - lineWidth,
            scaledY - 24,
            textWidth + 4,
            24
          );

          ctx.font = "14px monospace";
          ctx.fillStyle = "#000";
          ctx.fillText(text, scaledX, scaledY - 6);
        });

        setTimeout(detectFrame, 100 / 3);
      };
    })();
  }, [inferEngine, isLoading, isWebcam, workerId]);

  const handleButtonClick = () => {
    setIsWebcam((prev) => !prev);
  };

  return (
    <div>
      <h1>Cat</h1>

      <Nav links={catLinks} />

      {isLoading === null ? (
        <h2>Failed to load the model</h2>
      ) : isLoading ? (
        <h2>Loading the model...</h2>
      ) : (
        <div>
          <button onClick={handleButtonClick}>
            {isWebcam ? "Stop" : "Start"} Webcam
          </button>

          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              width={targetWidth}
              height={targetHeight}
            >
              <track kind="captions" />
            </video>

            <canvas
              ref={canvasRef}
              width={targetWidth}
              height={targetHeight}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
