import { DeleteFilled, SearchOutlined } from "@ant-design/icons";
import { Button, InputNumber, Select, Table, Typography } from "antd";
import { DefaultOptionType } from "antd/lib/select";
import { useReducer, useState } from "react";
import "./App.css";
import Chart, { ChartData } from "./components/Chart";
import Fipe, {
  IDefaultResponse,
  PossibleVehicleTypes,
  Vehicle,
} from "./service/Fipe";
import { ColumnsType } from "antd/lib/table";

const VehicleTypes: {
  name: string;
  value: PossibleVehicleTypes;
}[] = [
  { name: "Motos", value: "motorcycles" },
  { name: "Carros", value: "cars" },
  { name: "Caminhões", value: "trucks" },
];

export interface IVehicleTable {
  vehicle: Vehicle;
  key: string;
  color: string;
  brand: string;
  model: string;
  year: string;
  data: ChartData[];
}

function App() {
  const [, rerender] = useReducer(() => Date.now(), 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [brands, setBrands] = useState<IDefaultResponse[]>([]);
  const [models, setModels] = useState<IDefaultResponse[]>([]);
  const [years, setYears] = useState<IDefaultResponse[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle>({});

  const [qttMonths, setQttMonths] = useState<number>(24);

  const [vehicles, setVehicles] = useState<IVehicleTable[]>([]);

  const tableColumns: ColumnsType<IVehicleTable> = [
    {
      title: `Marca`,
      dataIndex: `brand`,
      key: `brand`,
    },
    {
      title: `Modelo`,
      dataIndex: `model`,
      key: `model`,
    },
    {
      title: `Ano`,
      dataIndex: `year`,
      key: `year`,
    },
    {
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          shape="circle"
          icon={<DeleteFilled />}
          onClick={() => handleVehicleRemoval(record)}
        />
      ),
    },
  ];

  const handleVehicleRemoval = (vehicle: IVehicleTable) => {
    const newVehicles = [...vehicles];
    const position = newVehicles.indexOf(vehicle);
    newVehicles.splice(position, 1);
    setVehicles(newVehicles);
  };

  const handleChangeType = (newType: PossibleVehicleTypes) => {
    setIsLoading(true);
    setVehicle((oldState) => {
      const newState = { ...oldState };
      newState.vehicleType = newType;
      newState.brandCode = "";
      newState.modelCode = "";
      newState.yearCode = "";
      Fipe.getBrands(newState)
        .then(({ data }) => {
          setBrands(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return newState;
    });
  };

  const handleChangeBrand = (newBrand: string) => {
    setIsLoading(true);
    setVehicle((oldState) => {
      const newState = { ...oldState };
      newState.brandCode = newBrand;
      newState.modelCode = "";
      newState.yearCode = "";
      Fipe.getVehicles(newState)
        .then(({ data }) => {
          setModels(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return newState;
    });
  };

  const handleChangeModel = (newModel: string) => {
    setIsLoading(true);
    setVehicle((oldState) => {
      const newState = { ...oldState };
      newState.modelCode = newModel;
      newState.yearCode = "";
      Fipe.getYears(newState)
        .then(({ data }) => {
          setYears(data);
        })
        .finally(() => {
          setIsLoading(false);
        });
      return newState;
    });
  };

  const handleChangeYear = (newYear: string) => {
    setVehicle((oldState) => {
      const newVehicle = oldState;
      newVehicle.yearCode = newYear;
      return newVehicle;
    });
    rerender();
  };

  const generateVehicleKey = (vehicle: Vehicle) => {
    return `${vehicle.brandCode}_${vehicle.modelCode}_${vehicle.yearCode}`;
  };

  const addVehicle = (newVehicle: Vehicle) => {
    const vehicleToAdd: IVehicleTable = {
      vehicle: newVehicle,
      key: generateVehicleKey(newVehicle),
      color: Math.floor(Math.random() * 16777215).toString(16),
      brand: brands.find((b) => b.code === newVehicle.brandCode)?.name || "",
      model: models.find((m) => m.code === newVehicle.modelCode)?.name || "",
      year: years.find((y) => y.code === newVehicle.yearCode)?.name || "",
      data: [],
    };
    setVehicles((prevVehicles) => [...prevVehicles, vehicleToAdd]);
  };

  const updateVehicleChart = (
    vehicle: Vehicle,
    value: number,
    month: string
  ) => {
    setVehicles((oldState) => {
      const newState = [...oldState];
      const key = generateVehicleKey(vehicle);
      const found = newState.find((v) => v.key === key);
      if (!found) return oldState;
      found.data = [
        ...found.data,
        {
          value,
          description: month,
        },
      ];
      return newState;
    });
  };

  const search = () => {
    setIsLoading(true);
    addVehicle(vehicle);
    Fipe.getPriceHistory(
      vehicle,
      qttMonths,
      (v, m) => updateVehicleChart(vehicle, v, m),
      () => setIsLoading(false)
    );
  };

  const filterFunction = (
    input: string,
    option: DefaultOptionType | undefined
  ) => {
    return (option!.children as unknown as string)
      .toLowerCase()
      .includes(input.toLowerCase());
  };

  return (
    <div className="container">
      <div className="fields">
        <div className="flex column">
          <Typography.Text strong>Tipo de veículo</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.vehicleType}
            onChange={handleChangeType}
          >
            {VehicleTypes.map((type) => (
              <Select.Option key={type.value} value={type.value}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex column">
          <Typography.Text strong>Marca</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.brandCode}
            onChange={handleChangeBrand}
            showSearch
            filterOption={filterFunction}
          >
            {brands.map((brand) => (
              <Select.Option key={brand.code} value={brand.code}>
                {brand.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex column">
          <Typography.Text strong>Modelo</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.modelCode}
            onChange={handleChangeModel}
            showSearch
            filterOption={filterFunction}
          >
            {models.map((model) => (
              <Select.Option key={model.code} value={model.code}>
                {model.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex column">
          <Typography.Text strong>Ano</Typography.Text>
          <Select
            loading={isLoading}
            disabled={isLoading}
            value={vehicle.yearCode}
            onChange={handleChangeYear}
          >
            {years.map((year) => (
              <Select.Option key={year.code} value={year.code}>
                {year.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex column">
          <Typography.Text strong>Ultimos X meses</Typography.Text>
          <InputNumber
            disabled={isLoading}
            min={1}
            value={qttMonths}
            onChange={setQttMonths}
            style={{ width: "100%" }}
          />
        </div>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={search}
          loading={isLoading}
        >
          Adicionar veículo
        </Button>
      </div>
      <Table columns={tableColumns} dataSource={vehicles} />
      <Chart name="main-chart" vehicles={vehicles} />
    </div>
  );
}

export default App;
