export default {
    db:  {
        url: process.env.DATABASE_URL || `postgres://${process.env.POSTGRES_USER || 'myhit'}:${process.env.POSTGRES_PASSWORD || 'myhit'}@${process.env.POSTGRES_HOST || '192.168.1.196'}/${process.env.POSTGRES_DB || 'myhit'}`,
        dialect: 'postgres'
    },
};