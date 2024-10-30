/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript:{                     //this is also done for deployment
        ignoreBuildErrors:true
    },
    eslint:{
        ignoreDuringBuilds:true
    }
};

export default nextConfig;
