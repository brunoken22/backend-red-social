/** @type {import('next').NextConfig} */
const nextConfig = {
    "compilerOptions": {
        "typeRoots": ["./types", "./node_modules/@types"]
      },
    experimental: {
        serverComponentsExternalPackages: ['sequelize', 'sequelize-typescript'],
    }
}

module.exports = nextConfig
