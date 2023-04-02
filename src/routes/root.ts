import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  
  fastify.get('/', async function (request, reply) {
    return { health: "OK" }
  })
}

export default root;
