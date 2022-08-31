import { SearchOutlined } from '@ant-design/icons'
import { Button, InputNumber, Select, Typography } from "antd"
import { DefaultOptionType } from 'antd/lib/select'
import { useReducer, useState } from "react"
import './App.css'
import Chart, { ChartData } from "./components/Chart"
import Fipe, { IDefaultResponse, PossibleVehicleTypes, Vehicle } from "./service/Fipe"

const VehicleTypes: {
  name: string
  value: PossibleVehicleTypes
}[] = [
  { name: 'Motos', value: 'motorcycles' },
  { name: 'Carros', value: 'cars' },
  { name: 'Caminhões', value: 'trucks' },
]

function App() {
  const [, rerender] = useReducer(() => Date.now(), 0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const [brands, setBrands] = useState<IDefaultResponse[]>([])
  const [models, setModels] = useState<IDefaultResponse[]>([])
  const [years, setYears] = useState<IDefaultResponse[]>([])
  const [vehicle, setVehicle] = useState<Vehicle>({})
  const [qttMonths, setQttMonths] = useState<number>(24)

  const [chartValues, setChartValues] = useState<ChartData[]>([])

  const handleChangeType = (newType: PossibleVehicleTypes) => {
    setIsLoading(true)
    setVehicle(oldState => {
      const newState = { ...oldState }
      newState.vehicleType = newType
      newState.brandCode = ''
      newState.modelCode = ''
      newState.yearCode = ''
      Fipe.getBrands(newState)
        .then(({data}) => {
          setBrands(data)
        })
        .finally(() => {
          setIsLoading(false)
        })
      return newState
    })
  }

  const handleChangeBrand = (newBrand: string) => {
    setIsLoading(true)
    setVehicle(oldState => {
      const newState = { ...oldState }
      newState.brandCode = newBrand
      newState.modelCode = ''
      newState.yearCode = ''
      Fipe.getVehicles(newState)
        .then(({data}) => {
          setModels(data)
        })
        .finally(() => {
          setIsLoading(false)
        })
      return newState
    })
  }

  const handleChangeModel = (newModel: string) => {
    setIsLoading(true)
    setVehicle(oldState => {
      const newState = { ...oldState }
      newState.modelCode = newModel
      newState.yearCode = ''
      Fipe.getYears(newState)
        .then(({data}) => {
          setYears(data)
        })
        .finally(() => {
          setIsLoading(false)
        })
      return newState
    })
  }

  const addValueToChart = (valor: number, month: string) => {
    setChartValues(oldState => {
      const newState = [...oldState]
      newState.push({
        value: valor,
        description: month
      })
      return newState
    })
  }

  const handleChangeYear = (newYear: string) => {
    setVehicle(oldState => {
      const newVehicle = oldState
      newVehicle.yearCode = newYear
      return newVehicle
    })
    rerender()
  }

  const search = () => {
    setIsLoading(true)
    setChartValues([])
    Fipe.getPriceHistory(
      vehicle,
      qttMonths,
      addValueToChart,
      () => setIsLoading(false)
    )
  }

  const filterFunction = (input: string, option: DefaultOptionType | undefined) => {
    return (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
  }

  return (
    <div className='container'>
      <div className='fields'>
        <div className='flex column'>
          <Typography.Text strong>Tipo de veículo</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.vehicleType}
            onChange={handleChangeType}
          >
            {VehicleTypes.map(type =>
              <Select.Option
                key={type.value}
                value={type.value}
              >
                {type.name}
              </Select.Option>
            )}
          </Select>
        </div>
        <div className='flex column'>
          <Typography.Text strong>Marca</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.brandCode}
            onChange={handleChangeBrand}
            showSearch
            filterOption={filterFunction}
          >
            {brands.map(brand =>
              <Select.Option
                key={brand.code}
                value={brand.code}
              >
                {brand.name}
              </Select.Option>
            )}
          </Select>
        </div>
        <div className='flex column'>
          <Typography.Text strong>Modelo</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.modelCode}
            onChange={handleChangeModel}
            showSearch
            filterOption={filterFunction}
          >
            {models.map(model =>
              <Select.Option
                key={model.code}
                value={model.code}
              >
                {model.name}
              </Select.Option>
            )}
          </Select>
        </div>
        <div className='flex column'>
          <Typography.Text strong>Ano</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.yearCode}
            onChange={handleChangeYear}
          >
            {years.map(year =>
              <Select.Option
                key={year.code}
                value={year.code}
              >
                {year.name}
              </Select.Option>
            )}
          </Select>
        </div>
        <div className='flex column'>
          <Typography.Text strong>Ultimos X meses</Typography.Text>
          <InputNumber
            disabled={isLoading}
            min={1}
            value={qttMonths}
            onChange={setQttMonths}
            style={{ width: '100%' }}
          />
        </div>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={search}
          loading={isLoading}
        >
          Search
        </Button>
      </div>
      
      <Chart name="oi" data={chartValues}/>
    </div>
  )
}

export default App
