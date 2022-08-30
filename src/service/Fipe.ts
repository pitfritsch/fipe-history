import api, { fipeApi } from "./api";

export type PossibleVehicleTypes = 'cars' | 'motorcycles' | 'trucks'

export interface IDefaultResponse {
  name: string
  code: string
}

interface FipeInfo {
  price: string
  brand: string
  model: string
  modelYear: number
  fuel: string
  codeFipe: string
  referenceMonth: string
  vehicleType: number
  fuelAcronym: string
}

export interface Vehicle {
  vehicleType?: PossibleVehicleTypes
  brandCode?: string
  modelCode?: string
  yearCode?: string
}

export interface MonthsRefs {
  Codigo: number
  Mes: string
}

//gasolina - 1
//diesel - 3
const fuelType: {
  [key: string]: number
} = {
  'Gasolina': 1,
  'Diesel': 3
}

function removeMask(value: string): number {
  return Number(value.replaceAll('R$ ', '').replaceAll('.', '').replaceAll(',', '.'))
}

export default class Fipe {
  static async getBrands(vehicle: Vehicle) {
    return await api.get<IDefaultResponse[]>(`${vehicle.vehicleType}/brands`)
  }

  static async getVehicles(vehicle: Vehicle) {
    return await api.get<IDefaultResponse[]>(`${vehicle.vehicleType}/brands/${vehicle.brandCode}/models`)
  }

  static async getYears(vehicle: Vehicle) {
    return await api.get<IDefaultResponse[]>(`${vehicle.vehicleType}/brands/${vehicle.brandCode}/models/${vehicle.modelCode}/years`)
  }
  
  static async getPriceHistory(
    vehicle: Vehicle,
    qttMonths: number,
    callback: (valor: number, month: string) => void,
    onEnd?: () => void
  ) {
    try {
      const { data: refs } = await fipeApi.post<MonthsRefs[]>('ConsultarTabelaDeReferencia')
      const { data: vehicleInfo } = await api.get<FipeInfo>(`${vehicle.vehicleType}/brands/${vehicle.brandCode}/models/${vehicle.modelCode}/years/${vehicle.yearCode}`)
      
      for (let index = 0; index < qttMonths; index++) {
        const ref = refs[index];
        const { data } = await fipeApi.post('ConsultarValorComTodosParametros', {
          codigoTabelaReferencia: ref.Codigo,
          codigoTipoVeiculo: vehicleInfo.vehicleType,
          codigoMarca: vehicle.brandCode,
          ano: vehicle.yearCode,
          codigoTipoCombustivel: fuelType[vehicleInfo.fuel] || 1,
          anoModelo: vehicleInfo.modelYear,
          codigoModelo: vehicle.modelCode
        })
        callback(removeMask(data.Valor), ref.Mes)
      }
    } catch (err) {
      console.error(err)
    } finally {
      onEnd?.()
    }
  }
}