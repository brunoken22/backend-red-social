/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
        bodyParser: {
            sizeLimit: '4mb' // Set desired value here
        }
    },    experimental: {
        serverComponentsExternalPackages: ['sequelize', 'sequelize-typescript'],
    }
}

module.exports = nextConfig
