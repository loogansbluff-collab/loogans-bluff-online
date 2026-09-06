# Loogans Bluff Town Layout

## Scale
- World units are approximately meters.
- Ground remains 80 x 80.
- Street player eye height remains 1.7.
- Building boxes should stay human-scale and readable from street level.

## Roads
- Main north/south road is 8 units wide.
- Main east/west road is 8 units wide.
- Roads cross at the origin.
- Road color is #5c4a3d.
- Keep the center intersection open for street spawn.

## Sidewalks
- Sidewalks are 2 units wide on both sides of both roads.
- Sidewalk color is #9aa3ad.
- Buildings must not overlap road or sidewalk space.

## Districts
- Civic: Town Hall, Cop Shop, Jail, Medical Center on the north side.
- Main street: Barber, Liquor, Hardware, Gas, Tavern, Barry's Repair Shop.
- Quiet residential: Home 1 through Home 4 farther from the intersection.
- Edge district: Dump House and both barns.
- Vacant lots remain on the outer north/south ring.

## Spacing
- Keep at least 3 units between building boxes.
- Shops/civic footprints should generally stay around 6x8 to 8x10.
- Homes should generally stay around 6x6 to 7x8.
- Shops/civic heights: 4 to 6, except Town Hall may be 7.
- Homes: 3.5 to 4.5 high.
- Barns: 4 to 5 high.
- Vacant lots: about 10x10.

## Later art batches
1. Main street shops
2. Civic
3. Homes
4. Barns and edge district
5. Physical lot sale signs

## Later asset rules
- Use low-poly original models.
- Share materials where practical.
- Use one texture atlas if textures become necessary.
- No interiors until the exterior town reads well.
- No floating HTML property names.
- Storefront names belong on building meshes later.
- Keep draw calls modest and test the Vercel build after each district.
- If trees are added later, prefer instancing rather than many separate meshes.
