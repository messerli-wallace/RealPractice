import Image from "next/image";
import loader from "../assets/catusjksk.gif"

const LoadingImage = () => {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Image src={loader} alt="loading..." />
        </div>
    )
};

export default LoadingImage