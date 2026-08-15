import type { Locale } from "./config";

export type Dictionary = {
  appName: string;
  tagline: string;
  language: string;
  nav: {
    dashboard: string;
    products: string;
    batches: string;
    directories: string;
    units: string;
    audit: string;
    users: string;
    more: string;
    scan: string;
    logout: string;
    menu: string;
  };
  common: {
    save: string;
      create: string;
      delete: string;
      cancel: string;
      edit: string;
      loading: string;
    search: string;
    back: string;
    actions: string;
    active: string;
    archived: string;
    status: string;
    required: string;
    error: string;
    notFound: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    invalid: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    products: string;
    batches: string;
    media: string;
    newBatch: string;
    empty: string;
  };
  products: {
    title: string;
    subtitle: string;
    add: string;
    new: string;
    sku: string;
    nameRu: string;
    nameUz: string;
    nameEn: string;
    descRu: string;
    descUz: string;
    descEn: string;
      unit: string;
      unitNone: string;
      category: string;
      categoryNone: string;
      skuAuto: string;
      empty: string;
    batchesCount: string;
    backToList: string;
    deleteConfirm: string;
    langSection: string;
  };
  batches: {
    title: string;
    subtitle: string;
    new: string;
    number: string;
    manufacturedAt: string;
    empty: string;
    media: string;
  };
  directories: {
    title: string;
    subtitle: string;
    unitsTitle: string;
    unitsDesc: string;
    categoriesTitle: string;
    categoriesDesc: string;
    open: string;
  };
  units: {
    title: string;
    subtitle: string;
    add: string;
    code: string;
    symbol: string;
    nameRu: string;
    nameUz: string;
    nameEn: string;
    empty: string;
    deleteConfirm: string;
  };
  categories: {
    title: string;
    subtitle: string;
    add: string;
    code: string;
    nameRu: string;
    nameUz: string;
    nameEn: string;
    empty: string;
    deleteConfirm: string;
  };
  public: {
    batch: string;
    batchNumber: string;
    manufacturedAt: string;
    characteristics: string;
    photos: string;
    videos: string;
    videoUploading: string;
    videoFailed: string;
    scanner: string;
    unit: string;
    category: string;
    notFound: string;
  };
  roles: {
    SUPER_ADMIN: string;
    ADMIN: string;
    EDITOR: string;
    VIEWER: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    appName: "Партии",
    tagline: "Учёт товаров и QR",
    language: "Язык",
    nav: {
      dashboard: "Дашборд",
      products: "Товары",
      batches: "Партии",
      directories: "Справочники",
      units: "Ед. измерения",
      audit: "Журнал",
      users: "Пользователи",
      more: "Ещё",
      scan: "Сканер QR",
      logout: "Выйти",
      menu: "Меню",
    },
    common: {
      save: "Сохранить",
      create: "Создать",
      delete: "Удалить",
      cancel: "Отмена",
      edit: "Изменить",
      loading: "Загрузка…",
      search: "Поиск",
      back: "Назад",
      actions: "Действия",
      active: "Активна",
      archived: "Архив",
      status: "Статус",
      required: "Обязательное поле",
      error: "Ошибка",
      notFound: "Не найдено",
    },
    login: {
      title: "Вход",
      subtitle: "Админка учёта партий",
      email: "Email",
      password: "Пароль",
      submit: "Войти",
      submitting: "Вход…",
      invalid: "Неверный email или пароль",
    },
    dashboard: {
      title: "Дашборд",
      subtitle: "Поиск и обзор партий",
      products: "Товары",
      batches: "Партии",
      media: "Медиа",
      newBatch: "Новая партия",
      empty: "Ничего не найдено",
    },
    products: {
      title: "Товары",
      subtitle: "Карточки продукции на 3 языках",
      add: "Добавить товар",
      new: "Новый товар",
      sku: "Артикул",
      nameRu: "Название (RU)",
      nameUz: "Название (UZ)",
      nameEn: "Название (EN)",
      descRu: "Описание (RU)",
      descUz: "Описание (UZ)",
      descEn: "Описание (EN)",
      unit: "Ед. измерения",
      unitNone: "Не выбрано",
      category: "Категория",
      categoryNone: "Не выбрано",
      skuAuto: "Присваивается автоматически",
      empty: "Товаров пока нет",
      batchesCount: "Партий",
      backToList: "К списку товаров",
      deleteConfirm: "Удалить товар и все его партии?",
      langSection: "Названия и описания",
    },
    batches: {
      title: "Партии",
      subtitle: "Номера, даты, QR и медиа",
      new: "Новая партия",
      number: "Номер партии",
      manufacturedAt: "Дата изготовления",
      empty: "Партий пока нет",
      media: "медиа",
    },
    directories: {
      title: "Справочники",
      subtitle: "Единицы измерения, категории и другие справочные данные",
      unitsTitle: "Единицы измерения",
      unitsDesc: "кг, шт, л и другие единицы для товаров",
      categoriesTitle: "Категории",
      categoriesDesc: "Группы товаров для удобной классификации",
      open: "Открыть",
    },
    units: {
      title: "Единицы измерения",
      subtitle: "Справочник ед. изм. на 3 языках",
      add: "Добавить единицу",
      code: "Код",
      symbol: "Символ",
      nameRu: "Название (RU)",
      nameUz: "Название (UZ)",
      nameEn: "Название (EN)",
      empty: "Единиц пока нет",
      deleteConfirm: "Удалить единицу измерения?",
    },
    categories: {
      title: "Категории",
      subtitle: "Справочник категорий на 3 языках",
      add: "Добавить категорию",
      code: "Код",
      nameRu: "Название (RU)",
      nameUz: "Название (UZ)",
      nameEn: "Название (EN)",
      empty: "Категорий пока нет",
      deleteConfirm: "Удалить категорию?",
    },
    public: {
      batch: "Партия",
      batchNumber: "Номер партии",
      manufacturedAt: "Дата изготовления",
      characteristics: "Характеристики",
      photos: "Фото",
      videos: "Видео",
      videoUploading: "Загрузка на YouTube…",
      videoFailed: "Не удалось загрузить на YouTube",
      scanner: "Сканер QR",
      unit: "Ед. изм.",
      category: "Категория",
      notFound: "Партия не найдена",
    },
    roles: {
      SUPER_ADMIN: "Супер-админ",
      ADMIN: "Админ",
      EDITOR: "Редактор",
      VIEWER: "Наблюдатель",
    },
  },
  uz: {
    appName: "Partiyalar",
    tagline: "Mahsulotlar va QR hisobi",
    language: "Til",
    nav: {
      dashboard: "Boshqaruv",
      products: "Mahsulotlar",
      batches: "Partiyalar",
      directories: "Ma’lumotnomalar",
      units: "O‘lchov birliklari",
      audit: "Jurnal",
      users: "Foydalanuvchilar",
      more: "Yana",
      scan: "QR skaner",
      logout: "Chiqish",
      menu: "Menyu",
    },
    common: {
      save: "Saqlash",
      create: "Yaratish",
      delete: "O‘chirish",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      loading: "Yuklanmoqda…",
      search: "Qidiruv",
      back: "Orqaga",
      actions: "Amallar",
      active: "Faol",
      archived: "Arxiv",
      status: "Holat",
      required: "Majburiy maydon",
      error: "Xato",
      notFound: "Topilmadi",
    },
    login: {
      title: "Kirish",
      subtitle: "Partiyalar admin paneli",
      email: "Email",
      password: "Parol",
      submit: "Kirish",
      submitting: "Kirilmoqda…",
      invalid: "Email yoki parol noto‘g‘ri",
    },
    dashboard: {
      title: "Boshqaruv",
      subtitle: "Partiyalarni qidirish va ko‘rish",
      products: "Mahsulotlar",
      batches: "Partiyalar",
      media: "Media",
      newBatch: "Yangi partiya",
      empty: "Hech narsa topilmadi",
    },
    products: {
      title: "Mahsulotlar",
      subtitle: "Mahsulot kartochkalari 3 tilda",
      add: "Mahsulot qo‘shish",
      new: "Yangi mahsulot",
      sku: "Artikul",
      nameRu: "Nomi (RU)",
      nameUz: "Nomi (UZ)",
      nameEn: "Nomi (EN)",
      descRu: "Tavsif (RU)",
      descUz: "Tavsif (UZ)",
      descEn: "Tavsif (EN)",
      unit: "O‘lchov birligi",
      unitNone: "Tanlanmagan",
      category: "Kategoriya",
      categoryNone: "Tanlanmagan",
      skuAuto: "Avtomatik beriladi",
      empty: "Hali mahsulot yo‘q",
      batchesCount: "Partiyalar",
      backToList: "Mahsulotlar ro‘yxatiga",
      deleteConfirm: "Mahsulot va uning barcha partiyalari o‘chirilsinmi?",
      langSection: "Nomlar va tavsiflar",
    },
    batches: {
      title: "Partiyalar",
      subtitle: "Raqamlar, sanalar, QR va media",
      new: "Yangi partiya",
      number: "Partiya raqami",
      manufacturedAt: "Ishlab chiqarilgan sana",
      empty: "Hali partiya yo‘q",
      media: "media",
    },
    directories: {
      title: "Ma’lumotnomalar",
      subtitle: "O‘lchov birliklari, kategoriyalar va boshqa ma’lumotnomalar",
      unitsTitle: "O‘lchov birliklari",
      unitsDesc: "kg, dona, l va boshqa birliklar",
      categoriesTitle: "Kategoriyalar",
      categoriesDesc: "Mahsulot guruhlari",
      open: "Ochish",
    },
    units: {
      title: "O‘lchov birliklari",
      subtitle: "O‘lchov birliklari ma’lumotnomasi 3 tilda",
      add: "Birlik qo‘shish",
      code: "Kod",
      symbol: "Belgi",
      nameRu: "Nomi (RU)",
      nameUz: "Nomi (UZ)",
      nameEn: "Nomi (EN)",
      empty: "Hali birlik yo‘q",
      deleteConfirm: "O‘lchov birligi o‘chirilsinmi?",
    },
    categories: {
      title: "Kategoriyalar",
      subtitle: "Kategoriyalar ma’lumotnomasi 3 tilda",
      add: "Kategoriya qo‘shish",
      code: "Kod",
      nameRu: "Nomi (RU)",
      nameUz: "Nomi (UZ)",
      nameEn: "Nomi (EN)",
      empty: "Hali kategoriya yo‘q",
      deleteConfirm: "Kategoriya o‘chirilsinmi?",
    },
    public: {
      batch: "Partiya",
      batchNumber: "Partiya raqami",
      manufacturedAt: "Ishlab chiqarilgan sana",
      characteristics: "Xususiyatlar",
      photos: "Foto",
      videos: "Video",
      videoUploading: "YouTube’ga yuklanmoqda…",
      videoFailed: "YouTube’ga yuklab bo‘lmadi",
      scanner: "QR skaner",
      unit: "O‘lchov birligi",
      category: "Kategoriya",
      notFound: "Partiya topilmadi",
    },
    roles: {
      SUPER_ADMIN: "Super-admin",
      ADMIN: "Admin",
      EDITOR: "Muharrir",
      VIEWER: "Kuzatuvchi",
    },
  },
  en: {
    appName: "Batches",
    tagline: "Product batches and QR",
    language: "Language",
    nav: {
      dashboard: "Dashboard",
      products: "Products",
      batches: "Batches",
      directories: "Directories",
      units: "Units",
      audit: "Audit log",
      users: "Users",
      more: "More",
      scan: "QR scanner",
      logout: "Sign out",
      menu: "Menu",
    },
    common: {
      save: "Save",
      create: "Create",
      delete: "Delete",
      cancel: "Cancel",
      edit: "Edit",
      loading: "Loading…",
      search: "Search",
      back: "Back",
      actions: "Actions",
      active: "Active",
      archived: "Archived",
      status: "Status",
      required: "Required",
      error: "Error",
      notFound: "Not found",
    },
    login: {
      title: "Sign in",
      subtitle: "Batch tracking admin",
      email: "Email",
      password: "Password",
      submit: "Sign in",
      submitting: "Signing in…",
      invalid: "Invalid email or password",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Search and review batches",
      products: "Products",
      batches: "Batches",
      media: "Media",
      newBatch: "New batch",
      empty: "Nothing found",
    },
    products: {
      title: "Products",
      subtitle: "Product cards in 3 languages",
      add: "Add product",
      new: "New product",
      sku: "SKU",
      nameRu: "Name (RU)",
      nameUz: "Name (UZ)",
      nameEn: "Name (EN)",
      descRu: "Description (RU)",
      descUz: "Description (UZ)",
      descEn: "Description (EN)",
      unit: "Unit of measure",
      unitNone: "Not selected",
      category: "Category",
      categoryNone: "Not selected",
      skuAuto: "Assigned automatically",
      empty: "No products yet",
      batchesCount: "Batches",
      backToList: "Back to products",
      deleteConfirm: "Delete product and all its batches?",
      langSection: "Names and descriptions",
    },
    batches: {
      title: "Batches",
      subtitle: "Numbers, dates, QR and media",
      new: "New batch",
      number: "Batch number",
      manufacturedAt: "Manufactured at",
      empty: "No batches yet",
      media: "media",
    },
    directories: {
      title: "Directories",
      subtitle: "Units of measure, categories and other reference data",
      unitsTitle: "Units of measure",
      unitsDesc: "kg, pcs, L and other units for products",
      categoriesTitle: "Categories",
      categoriesDesc: "Product groups for classification",
      open: "Open",
    },
    units: {
      title: "Units of measure",
      subtitle: "Units directory in 3 languages",
      add: "Add unit",
      code: "Code",
      symbol: "Symbol",
      nameRu: "Name (RU)",
      nameUz: "Name (UZ)",
      nameEn: "Name (EN)",
      empty: "No units yet",
      deleteConfirm: "Delete this unit?",
    },
    categories: {
      title: "Categories",
      subtitle: "Categories directory in 3 languages",
      add: "Add category",
      code: "Code",
      nameRu: "Name (RU)",
      nameUz: "Name (UZ)",
      nameEn: "Name (EN)",
      empty: "No categories yet",
      deleteConfirm: "Delete this category?",
    },
    public: {
      batch: "Batch",
      batchNumber: "Batch number",
      manufacturedAt: "Manufactured at",
      characteristics: "Specifications",
      photos: "Photos",
      videos: "Videos",
      videoUploading: "Uploading to YouTube…",
      videoFailed: "Could not upload to YouTube",
      scanner: "QR scanner",
      unit: "Unit",
      category: "Category",
      notFound: "Batch not found",
    },
    roles: {
      SUPER_ADMIN: "Super admin",
      ADMIN: "Admin",
      EDITOR: "Editor",
      VIEWER: "Viewer",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.ru;
}
