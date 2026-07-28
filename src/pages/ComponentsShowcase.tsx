import { useState } from "react";
import { getRecommendations } from "../api";
import Accordion from "../components/UI/Accordion/Accordion";
import ActionButton from "../components/UI/ActionButton";
import CropCard from "../components/UI/CropCard/CropCard";
import Input from "../components/UI/Input/Input";
import Logo from "../components/UI/Logo/Logo";
import Nav from "../components/UI/Nav/Nav";
import SearchBar from "../components/UI/SearchBar/SearchBar";
import Select from "../components/UI/Select/Select";
import type { RecommendationModalProps } from "../components/plot/modals/RecommendationModal";
import RecommendationModal from "../components/plot/modals/RecommendationModal";

export default function ComponentsShowcase() {
  const [searchValue, setSearchValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");

  const handleActionClick = (action: string) => {
    alert(`Нажата кнопка: ${action}`);
  };

  // const samplePlots = [
  //   {
  //     id: "1",
  //     name: "Пример",
  //     width: 30,
  //     height: 30,
  //     bedsCount: 5,
  //     cropsCount: 7,
  //   },
  // ];

  const sampleCrops = [
    {
      id: "1",
      name: "Томат",
      family: "Паслёновые",
      group: "Овощные",
      vegetationDays: 150,
      soilNeeds: "Глинистая",
      lightNeeds: "Полутень",
      description: "Популярная овощная культура",
    },
  ];

  const selectOptions = [
    { value: "1", label: "Опция 1" },
    { value: "2", label: "Опция 2" },
    { value: "3", label: "Опция 3" },
  ];

  // Навигационные ссылки (для компонента Nav)
  const navLinks = [
    { label: "Мои участки", to: "/" },
    { label: "Каталог культур", to: "/catalog" },
  ];

  const recomModalProps: RecommendationModalProps = {
    bed: {
      id: "a381f213-9828-421b-86e5-88dc57a2fb8e",
      name: "грядка",
      width: 10,
      height: 12,
    } as any,
    fetchCultures: getRecommendations,
    onPlant: () => {},
    onClose: () => {},
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1F2937" }}
          >
            Модалки
          </h2>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "12px" }}>
              Рекомендации посадки:
            </p>
            <RecommendationModal {...recomModalProps} />
          </div>
        </section>

        {/* Логотип и навигация */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1F2937" }}
          >
            Логотип и навигация
          </h2>

          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "12px" }}>Логотип:</p>
            <Logo />
          </div>

          <div>
            <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "12px" }}>Навигация:</p>
            {/* Используем компонент Nav с переданными ссылками */}
            <Nav links={navLinks} />
          </div>
        </section>

        {/* Кнопки */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1F2937" }}
          >
            Кнопки
          </h2>

          {/* Маленькие квадратные */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#6B7280",
              }}
            >
              Маленькие квадратные (littleSquare)
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <ActionButton
                icon="edit"
                color="greenLight"
                shape="littleSquare"
                onClick={() => handleActionClick("edit little")}
              />
              <ActionButton
                icon="delete"
                color="red"
                shape="littleSquare"
                onClick={() => handleActionClick("delete little")}
              />
              <ActionButton
                icon="cancel"
                color="red"
                shape="littleSquare"
                onClick={() => handleActionClick("cancel little")}
              />
            </div>
          </div>

          {/* Квадратные */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#6B7280",
              }}
            >
              Квадратные (square)
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <ActionButton
                icon="edit"
                color="greenLight"
                shape="square"
                onClick={() => handleActionClick("edit square light")}
              />
              <ActionButton
                icon="delete"
                color="red"
                shape="square"
                onClick={() => handleActionClick("delete square")}
              />
              <ActionButton
                icon="cancel"
                color="red"
                shape="square"
                onClick={() => handleActionClick("cancel square")}
              />
            </div>
          </div>

          {/* Круглые */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#6B7280",
              }}
            >
              Круглые (circle)
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <ActionButton
                icon="add"
                color="greenDark"
                shape="circle"
                onClick={() => handleActionClick("add circle dark")}
              />
            </div>
          </div>

          {/* Текстовые */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "12px",
                color: "#6B7280",
              }}
            >
              Текстовые (text)
            </h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <ActionButton
                title="Удалить"
                color="red"
                shape="text"
                onClick={() => handleActionClick("delete text red")}
              />
              <ActionButton
                title="Сохранить"
                color="greenLight"
                shape="text"
                onClick={() => handleActionClick("save text")}
              />
              <ActionButton
                title="Отмена"
                shape="text"
                onClick={() => handleActionClick("cancel text")}
              />
            </div>
          </div>
        </section>

        {/* Формы */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1F2937" }}
          >
            Формы
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            {/* Input */}
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  marginBottom: "16px",
                  color: "#374151",
                }}
              >
                Input (Поля ввода)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Введите название участка"
                />
                <Input value="" onChange={() => {}} placeholder="Email" />
                <Input value="" onChange={() => {}} placeholder="Пароль" />
              </div>
            </div>

            {/* Select */}
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  marginBottom: "16px",
                  color: "#374151",
                }}
              >
                Select (Выпадающие списки)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Select
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  options={selectOptions}
                />
              </div>
            </div>
          </div>

          {/* SearchBar */}
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              SearchBar (Поиск)
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "600px" }}
            >
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Поиск участков"
              />
            </div>
          </div>

          {/* Accordion */}
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              Accordion (Раскрывающиеся секции)
            </h3>
            <div
              style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Accordion
                title="Предшественники (хорошие)"
                content="Томат, Огурец, Капуста, Кабачок"
                variant="success"
              />
            </div>
          </div>
        </section>

        {/* Карточки */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: "#1F2937" }}
          >
            Карточки
          </h2>

          {/* PlotCard */}
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              PlotCard (Карточка участка)
            </h3>
            {/* <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {samplePlots.map((plot) => (
                <PlotCard
                  key={plot.id}
                  plot={plot}
                  onEdit={() => alert(`Edit plot: ${plot.name}`)}
                  onDelete={() => alert(`Delete plot: ${plot.name}`)}
                />
              ))}
            </div> */}
          </div>

          {/* CropCard */}
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              CropCard (Карточка культуры)
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {sampleCrops.map((crop) => (
                <CropCard
                  key={crop.id}
                  id={crop.id}
                  name={crop.name}
                  family={crop.family}
                  vegetationDays={crop.vegetationDays}
                  soilNeeds={crop.soilNeeds}
                  lightNeeds={crop.lightNeeds}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
