import Layout from "../components/ResponsibleGaming/Layout";
import OtpLogin from "../components/Auth/OtpLogin";

export default function LoginPage() {
    return (
        <Layout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <OtpLogin />
            </div>
        </Layout>
    );
}
