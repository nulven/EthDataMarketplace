struct Field:
  member x : felt
end

func iter(
  field_elements : Field*,
  k : felt,
  t7_1 : felt,
  n_steps
) -> (final_t, final_t6):

  # why doesn't the following work?
  # let t = k + t7_1 + field_elements.x

  [ap] = field_elements.x; ap++
  [ap] = t7_1 + [ap-1]; ap++ # t
  [ap] = [ap-1]*[ap-1]; ap++ # t2
  [ap] = [ap-1]*[ap-1]; ap++ # t4
  [ap] = [ap-1]*[ap-1]; ap++ # t6

  if n_steps != 0:
    let t7 = [ap-4]*[ap-1]
    iter(
      field_elements + Field.SIZE,
      k,
      t7,
      n_steps - 1
    )
    ret
  else:
    return (final_t=[ap-4], final_t6=[ap-1])
  end
end

func mimc7(
  field_elements : Field*,
  x_in : felt,
  k : felt,
  nrounds : felt
) -> (out):
  alloc_locals

  let t = k + x_in
  let t2 = t*t
  let t4 = t2*t2
  let t6 = t4*t4

  let t7 = t6*t

  let (__fp__, _) = get_fp_and_pc()
  let (final_t, final_t6) = iter(
    field_elements + Field.SIZE,
    k,
    t7,
    nrounds - 2
  )
  [ap] = final_t6; ap++
  [ap] = final_t; ap++
  [ap] = [ap-1]*[ap-2]; ap++
  [ap] = [ap-1] + k; ap++
  return (out=[ap-1])
end

func main():
  alloc_locals

  local field_elements : Field*
  local x_in : felt
  local k : felt
  local nrounds : felt

  %{
    field_elements1 = program_input['field_elements']
    x_in1 = program_input['x_in']
    k1 = program_input['k']
    nrounds1 = program_input['nrounds']

    ids.field_elements = field_elements = segments.add()
    for i, val in enumerate(field_elements1):
      memory[field_elements + i] = val

    ids.x_in = program_input['x_in']
    ids.k = program_input['k']
    ids.nrounds = program_inputs['nrounds']
  %}

  let (out) = mimc7(field_elements, x_in, k, nrounds)
  [ap] = out; ap++
  %{
    print('Hash', memory[ap-1])
  %}
  return ()
end
