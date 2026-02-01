module.exports = {
apps: [
{
name: "dopik-electronics",
script: "dist/index.cjs",
cwd: "/home/deploy/apps/dopik-electronics/dopik-electronics (1)",
node_args: "",
env: {
NODE_ENV: "production",
DATABASE_URL: "postgresql://dopik-user:Dopik-Electronics-12@localhost:5432/dopik-db"
}
}
]
};

