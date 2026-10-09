package widenassert

type User struct{}

func bad() {
	u := User{}
	var value any = u
	_ = value.(User) // want "widened.*asserted"
	broad := any(User{})
	_ = broad.(User) // want "widened.*asserted"
}
func good(input any, other any) {
	_ = input.(User)
	var value any = User{}
	value = other
	_ = value.(User)
	var justWidened any = User{}
	_ = justWidened
}
func escaped() {
	var value any = User{}
	use(value)
	_ = value.(User)
}
func use(any) {}
