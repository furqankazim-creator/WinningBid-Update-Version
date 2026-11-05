export const avg = (v: { ratings: { price: number; quality: number; schedule: number; hse: number }[] }) => {
  if (!v.ratings.length) return null;
  const s = v.ratings.reduce((a, r) => a + (r.price + r.quality + r.schedule + r.hse) / 4, 0);
  return (s / v.ratings.length).toFixed(1);
};
