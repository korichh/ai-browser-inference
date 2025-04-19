import { Nav } from "../components/common";

const homeLinks = [
  { url: "/upload", label: "Upload" },
  { url: "/webcam", label: "Webcam" },
  { url: "/cat", label: "Cat" },
];

export default function Home() {
  return (
    <div>
      <h1>Home</h1>

      <Nav links={homeLinks} />
    </div>
  );
}
