import { Nav } from "../components/common";
import { TPrediction } from "../types";
import { InferenceEngine, CVImage } from "inferencejs";
import { useEffect, useState, useMemo, useRef } from "react";

const uploadLinks = [
  { url: "/", label: "Home" },
  { url: "/webcam", label: "Webcam" },
  { url: "/cat", label: "Cat" },
];

export default function Upload() {
  const inferEngine = useMemo(() => {
    return new InferenceEngine();
  }, []);

  const [isLoading, setIsLoading] = useState<boolean | null>(false);
  const [workerId, setWorkerId] = useState<string>("");

  const [upload, setUpload] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targetWidth = 400;

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const workerId = await inferEngine.startWorker(
          "face-yswgd",
          1,
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
    if (isLoading || isLoading === null || !upload) return;

    (async () => {
      try {
        const imageBitmap = await createImageBitmap(upload);
        const cvimg = new CVImage(imageBitmap);

        const predictions = (await inferEngine.infer(
          workerId,
          cvimg
        )) as TPrediction[];

        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const imageBitmap = await createImageBitmap(upload);

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const scaleFactor = targetWidth / imageBitmap.width;
          const targetHeight = imageBitmap.height * scaleFactor;

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          ctx.clearRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(
            imageBitmap,
            0,
            0,
            imageBitmap.width,
            imageBitmap.height,
            0,
            0,
            targetWidth,
            targetHeight
          );

          predictions.forEach((prediction) => {
            const { x, y, width, height } = prediction.bbox;

            const lineWidth = 2;
            const scaledX = (x - width / 2) * scaleFactor;
            const scaledY = (y - height / 2) * scaleFactor;
            const scaledWidth = width * scaleFactor;
            const scaledHeight = height * scaleFactor;
            const text = `${prediction.class} ${Math.round(prediction.confidence * 100)}%`;
            const textWidth = ctx.measureText(text).width;

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = prediction.color;
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

            ctx.fillStyle = prediction.color;
            ctx.fillRect(
              scaledX - lineWidth,
              scaledY - 24,
              textWidth + 24,
              24
            );

            ctx.font = "14px monospace";
            ctx.fillStyle = "#000";
            ctx.fillText(text, scaledX, scaledY - 6);
          });
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [inferEngine, isLoading, workerId, upload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setUpload(files[0]);
    } else {
      setUpload(null);
    }
  };

  return (
    <div>
      <h1>Upload</h1>

      <Nav links={uploadLinks} />

      {isLoading === null ? (
        <h2>Failed to load the model</h2>
      ) : isLoading ? (
        <h2>Loading the model...</h2>
      ) : (
        <div>
          <input
            type="file"
            onChange={handleInputChange}
            style={{
              border: "1px dashed #000",
              width: "300px",
              height: "100px",
            }}
          />

          {upload ? (
            <div style={{ display: "flex", gap: "12px" }}>
              <div>
                <h2>Input:</h2>

                <img
                  src={URL.createObjectURL(upload)}
                  alt="upload preview"
                  width={targetWidth}
                />
              </div>

              <div>
                <h2>Output:</h2>

                <canvas ref={canvasRef} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
