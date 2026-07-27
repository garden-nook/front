export interface CanvasStyles {
  // Фон
  background: string;

  // Сетка
  grid: {
    color: string;
    lineWidth: number;
  };

  // Объекты
  objects: {
    bed: {
      fillAlpha: number;
      strokeColor: string;
      strokeWidth: number;
    };
    static: {
      fillAlpha: number;
      strokeColor: string;
      strokeWidth: number;
    };
    selected: {
      strokeColor: string;
      strokeWidth: number;
    };
    hovered: {
      dashPattern: [number, number];
    };
  };

  // Текст
  text: {
    fontFamily: string;
    colors: {
      primary: string;
      secondary: string;
      light: string;
    };
  };

  // Размеры
  sizes: {
    cellBaseSize: number;
    fontSize: {
      small: number;
      medium: number;
      large: number;
    };
  };

  // Рисование (выделение)
  drawing: {
    color: string;
    fillAlpha: number;
    strokeWidth: number;
    dashPattern: [number, number];
  };

  // Информация
  info: {
    color: string;
    fontSize: number;
  };
}

export const canvasStyles: CanvasStyles = {
  background: "#f8fafc",

  grid: {
    color: "#cbd5e1",
    lineWidth: 0.5,
  },

  objects: {
    bed: {
      fillAlpha: 0.3,
      strokeColor: "#22c55e",
      strokeWidth: 2,
    },
    static: {
      fillAlpha: 0.7,
      strokeColor: "#1e293b",
      strokeWidth: 1,
    },
    selected: {
      strokeColor: "#2563eb",
      strokeWidth: 3,
    },
    hovered: {
      dashPattern: [4, 4],
    },
  },

  text: {
    fontFamily: "system-ui",
    colors: {
      primary: "#ffffff",
      secondary: "#94a3b8",
      light: "#ffffff",
    },
  },

  sizes: {
    cellBaseSize: 20,
    fontSize: {
      small: 8,
      medium: 10,
      large: 14,
    },
  },

  drawing: {
    color: "#22c55e",
    fillAlpha: 0.2,
    strokeWidth: 2,
    dashPattern: [6, 4],
  },

  info: {
    color: "#94a3b8",
    fontSize: 11,
  },
};

// Иконки для статических объектов
export const staticObjectIcons: Record<string, string> = {
  building: "🏠",
  tree: "🌳",
  path: "🛤️",
  water: "💧",
};
