import axios from "axios";

const api = axios.create({
  baseURL: 'https://parallelum.com.br/fipe/api/v2'
})

export const fipeApi = axios.create({
  baseURL: 'https://fipe.contrateumdev.com.br/api'
})

fipeApi.interceptors.request.use((config) => {
  config.headers = {
    chave: '$2y$10$8IAZn7HKq7QJWbh37N3GOOeRVv'
  }
  return config
})

export default api