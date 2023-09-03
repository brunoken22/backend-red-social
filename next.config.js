/** @type {import('next').NextConfig} */
const nextConfig = {

    experimental: {
        serverComponentsExternalPackages: ['sequelize', 'sequelize-typescript'],
    }
}

module.exports = nextConfig
