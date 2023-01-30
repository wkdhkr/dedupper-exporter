export type MainViewerState = {
  faces: {
    gender: "Female" | "Male";
    face;
  }[];
  currentImage: {
    hash: string;
    size: number;
    width: number;
    height: number;
    timestamp: 1549156654717;
    acd_id: string;
    trim: string;
    rating: number;
    missing: number;
    view_date: number;
    view_count: number;
    /*
    t1: null,
    t2: null,
    t3: null,
    t4: null,
    t5: null,
    t6: null,
    t7: null,
    t8: null,
    t9: null,
    t10: null,
    t11: null,
    */
    neutral: number;
    drawing: number;
    hentai: number;
    hentai_porn: number;
    hentai_porn_sexy: number;
    hentai_sexy: number;
    porn: number;
    porn_sexy: number;
    sexy: number;
    p_hash: string;
  };
};
