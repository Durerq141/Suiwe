// Key dimensions of the sedan (metres, +x = left, +y = up, +z = forward).
// They match the physics/collider layout the game was tuned with.
export const DIMS = {
  halfWidth: 0.965,
  zFront: 2.44,
  zRear: -2.88,
  axleF: 1.45,
  axleR: -1.45,
  track: 0.795, // wheel centre |x|
  wheelR: 0.345,
  tyreW: 0.235,
  archR: 0.448,
  archY: 0.352,
  roofY: 1.49,
  zCowl: 0.855,
  zWindshieldTop: 0.21,
  zDoorSplit: -0.385,
  zRearWindowTop: -1.28,
  zDeck: -1.9,
  yFloor: 0.29,
  yDoorBottom: 0.33,
} as const;
