func multiiter(
  r : felt*,
  in: felt*,
  field_elements : felt*,
  n_steps,
  nrounds
):
  let output = mimc7(field_elements, [in], [r], n_steps)
  [r + 1] = [r] + [in] + output.res
end

func multimimc7(
  in : felt*,
  k : felt*,
  ninputs,
  field_elements : felt*,
  nrounds
):
  alloc_locals

  let (local r : felt*) = alloc()
  let (local mims : felt*) = alloc()

  [r] = k
  multiiter(r, in, field_elements, nrounds, nrounds)
  let out = [r + ninputs - 1]
end

